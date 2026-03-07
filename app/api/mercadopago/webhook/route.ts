import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MP_API = "https://api.mercadopago.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");

  if (topic !== "payment" || !id) {
    return NextResponse.json({ ok: true });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "MP not configured" }, { status: 500 });
  }

  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const payment = (await res.json()) as {
    status?: string;
    external_reference?: string;
  };
  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true });
  }

  let ref: { company_id?: string; plan_slug?: string };
  try {
    ref = JSON.parse(payment.external_reference ?? "{}");
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (!ref.company_id || !ref.plan_slug) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });
  }

  const { error } = await supabase
    .from("companies")
    .update({
      plan_slug: ref.plan_slug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ref.company_id);

  if (error) {
    console.error("Webhook MP update company:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Alguns ambientes MP enviam POST. */
export async function POST(request: NextRequest) {
  return GET(request);
}
