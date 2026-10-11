import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const expectedSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-webhook-secret");
  if (!expectedSecret) return json(503, { error: "webhook_secret_not_configured" });
  if (!providedSecret || providedSecret !== expectedSecret) return json(401, { error: "invalid_webhook_secret" });

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const provider = String(payload?.provider || "").trim();
  const eventId = String(payload?.event_id || "").trim();
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
  if (![1500, 5000, 6500, 10000, 18000].includes(amountCents)) {
    return json(422, { error: "unsupported_commercial_amount" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json(503, { error: "supabase_service_not_configured" });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc("process_confirmed_commercial_payment", {
    p_provider: provider,
    p_event_id: eventId,
    p_intake_id: intakeId,
    p_amount_cents: amountCents,
    p_payment_reference: paymentReference,
    p_raw_payload: payload,
  });

  if (error) {
    const message = error.message || "payment_processing_failed";
    const status = message.includes("addon_requires_existing_basic_plan") ? 409
      : message.includes("unsupported_commercial_amount") ? 422
      : message.includes("intake_not_found") ? 404
      : 500;
    return json(status, { error: message });
  }

  return json(200, { ok: true, entitlement: data });
});
