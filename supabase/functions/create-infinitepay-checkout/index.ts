import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const PRODUCTS: Record<number, { productCode: string; addon: boolean; description: string }> = {
  1500: { productCode: "CARE_7_BASIC", addon: true, description: "Relatório completo — adicional" },
  5000: { productCode: "CARE_7_BASIC", addon: false, description: "Jornada 7 dias — áudio personalizado" },
  6500: { productCode: "CARE_7_BASIC", addon: true, description: "Jornada 7 dias + relatório completo" },
  10000: { productCode: "CARE_7_GUIDED", addon: false, description: "Jornada 7 dias — com meditação guiada e relatório completo" },
  18000: { productCode: "CARE_21", addon: false, description: "Jornada 21 dias — completa" },
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const handle = Deno.env.get("INFINITEPAY_HANDLE");
  const appBaseUrl = Deno.env.get("APP_BASE_URL");

  if (!supabaseUrl || !serviceRole || !anonKey) return json(503, { error: "supabase_not_configured" });
  if (!handle) return json(503, { error: "infinitepay_handle_not_configured" });

  const authorization = req.headers.get("authorization") || "";
  const token = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!token) return json(401, { error: "missing_authorization" });

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json(401, { error: "invalid_session" });

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const intakeId = String(payload?.intake_id || "").trim();
  const amountCents = Number(payload?.amount_cents);
  const product = PRODUCTS[amountCents];
  if (!intakeId || !product) return json(422, { error: "invalid_commercial_selection" });

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (amountCents === 1500) {
    const { data: existing } = await admin
      .from("commercial_entitlements")
      .select("product_code,status")
      .eq("intake_id", intakeId)
      .maybeSingle();
    if (!existing || existing.product_code !== "CARE_7_BASIC" || existing.status !== "active") {
      return json(409, { error: "addon_requires_existing_basic_plan" });
    }
  }

  const orderNsu = `anam-${intakeId}-${crypto.randomUUID()}`;
  const { data: orderId, error: orderError } = await admin.rpc("create_checkout_order_for_user", {
    p_user_id: userData.user.id,
    p_intake_id: intakeId,
    p_amount_cents: amountCents,
    p_order_nsu: orderNsu,
    p_product_code: product.productCode,
    p_full_report_addon: product.addon,
  });
  if (orderError) return json(400, { error: orderError.message });

  const body: any = {
    handle,
    order_nsu: orderNsu,
    webhook_url: `${supabaseUrl}/functions/v1/infinitepay-payment-webhook`,
    items: [{ quantity: 1, price: amountCents, description: product.description }],
  };
  if (appBaseUrl) {
    body.redirect_url = `${appBaseUrl.replace(/\/$/, "")}/pagamento-concluido`;
  }

  const response = await fetch("https://api.checkout.infinitepay.io/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    await admin
      .from("commercial_checkout_orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    return json(502, { error: "infinitepay_checkout_failed", details: data });
  }

  const checkoutUrl = data?.url || data?.checkout_url || data?.link || data?.payment_url || null;
  const invoiceSlug = data?.slug || data?.invoice_slug || null;
  await admin
    .from("commercial_checkout_orders")
    .update({
      status: "pending",
      checkout_url: checkoutUrl,
      invoice_slug: invoiceSlug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return json(200, {
    ok: true,
    order_nsu: orderNsu,
    checkout_url: checkoutUrl,
    provider_response: data,
  });
});
