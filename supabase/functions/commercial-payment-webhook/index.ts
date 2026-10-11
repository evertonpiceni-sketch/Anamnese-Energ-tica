import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const allowedAmounts = [100, 1500, 5000, 6500, 10000, 18000];

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json(503, { error: "supabase_service_not_configured" });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const infiniteOrder = String(payload?.order_nsu || "").trim();
  const infiniteTransaction = String(payload?.transaction_nsu || "").trim();
  const infiniteSlug = String(payload?.invoice_slug || payload?.slug || "").trim();

  if (infiniteOrder && infiniteTransaction && infiniteSlug) {
    const handle = "evertonterapeuta";

    const { data: order, error: orderError } = await admin
      .from("commercial_checkout_orders")
      .select("intake_id,amount_cents")
      .eq("order_nsu", infiniteOrder)
      .maybeSingle();

    if (orderError || !order) {
      return json(400, { success: false, message: "order_not_found" });
    }

    const checkResponse = await fetch("https://api.checkout.infinitepay.io/payment_check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        handle,
        order_nsu: infiniteOrder,
        transaction_nsu: infiniteTransaction,
        slug: infiniteSlug,
      }),
    });

    let check: any = {};
    try {
      check = await checkResponse.json();
    } catch {
      // Resposta inválida é tratada como pagamento não confirmado.
    }

    if (!checkResponse.ok || check?.success !== true || check?.paid !== true) {
      return json(400, { success: false, message: "payment_not_confirmed" });
    }

    if (Number(check?.amount) !== Number(order.amount_cents)) {
      return json(400, { success: false, message: "payment_amount_mismatch" });
    }

    const paymentReference = String(payload?.receipt_url || infiniteTransaction);
    const { data, error } = await admin.rpc("process_confirmed_commercial_payment", {
      p_provider: "infinitepay",
      p_event_id: infiniteTransaction,
      p_intake_id: order.intake_id,
      p_amount_cents: order.amount_cents,
      p_payment_reference: paymentReference,
      p_raw_payload: {
        order_nsu: infiniteOrder,
        transaction_nsu: infiniteTransaction,
        invoice_slug: infiniteSlug,
        receipt_url: payload?.receipt_url || null,
        payment_check: check,
      },
    });

    if (error) return json(400, { success: false, message: error.message });

    const { error: markError } = await admin.rpc("mark_checkout_order_paid", {
      p_order_nsu: infiniteOrder,
      p_transaction_nsu: infiniteTransaction,
      p_invoice_slug: infiniteSlug,
      p_payment_reference: paymentReference,
    });

    if (markError) return json(400, { success: false, message: markError.message });

    return json(200, { success: true, message: null, entitlement: data });
  }

  const expectedSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-webhook-secret");
  const authorization = req.headers.get("authorization") || "";
  const bearerToken = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";

  let authorizedAsAdmin = false;
  if (bearerToken) {
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    });
    const { data: userData } = await userClient.auth.getUser(bearerToken);
    if (userData.user) {
      const { data: profile } = await userClient
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      authorizedAsAdmin = profile?.role === "admin";
    }
  }

  const authorizedBySecret = Boolean(
    expectedSecret && providedSecret && providedSecret === expectedSecret
  );
  if (!authorizedAsAdmin && !authorizedBySecret) {
    return json(401, { error: "unauthorized" });
  }

  const provider = String(payload?.provider || (authorizedAsAdmin ? "manual_admin" : "")).trim();
  const eventId = String(
    payload?.event_id || (authorizedAsAdmin ? `manual-${crypto.randomUUID()}` : "")
  ).trim();
  const intakeId = String(payload?.intake_id || "").trim();
  const amountCents = Number(payload?.amount_cents);
  const paymentReference = payload?.payment_reference ? String(payload.payment_reference) : null;
  const paymentStatus = String(payload?.payment_status || "confirmed").toLowerCase();

  if (paymentStatus !== "confirmed") {
    return json(202, { ignored: true, reason: "payment_not_confirmed" });
  }
  if (!provider || !eventId || !intakeId || !Number.isInteger(amountCents)) {
    return json(400, { error: "missing_or_invalid_fields" });
  }
  if (!allowedAmounts.includes(amountCents)) {
    return json(422, { error: "unsupported_commercial_amount" });
  }

  const { data, error } = await admin.rpc("process_confirmed_commercial_payment", {
    p_provider: provider,
    p_event_id: eventId,
    p_intake_id: intakeId,
    p_amount_cents: amountCents,
    p_payment_reference: paymentReference,
    p_raw_payload: {
      provider,
      event_id: eventId,
      intake_id: intakeId,
      amount_cents: amountCents,
      accepted_via: authorizedAsAdmin ? "admin_session" : "webhook_secret",
    },
  });

  if (error) return json(400, { error: error.message });
  return json(200, { ok: true, entitlement: data });
});
