"use server";

import { getMyCompany } from "@/app/actions/companies";
import { createClient } from "@/lib/supabase/server";

const MP_API = "https://api.mercadopago.com";

/** Cria preferência de pagamento no Mercado Pago (Checkout Pro) e retorna o link. */
export async function createCheckoutPreference(planSlug: string): Promise<{
  error: string | null;
  initPoint?: string;
}> {
  if (planSlug !== "basic" && planSlug !== "pro") {
    return { error: "Plano inválido." };
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return { error: "Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login para assinar um plano." };

  const company = await getMyCompany();
  if (!company) return { error: "Cadastre sua empresa primeiro (Configurações ou onboarding)." };

  const planConfig: Record<string, { title: string; unit_price: number }> = {
    basic: { title: "Easy & Fast - Plano Basic (mensal)", unit_price: 49.9 },
    pro: { title: "Easy & Fast - Plano Pro (mensal)", unit_price: 99.9 },
  };
  const plan = planConfig[planSlug];
  if (!plan) return { error: "Plano não encontrado." };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const externalRef = JSON.stringify({
    company_id: company.id,
    plan_slug: planSlug,
  });

  const body = {
    items: [
      {
        id: planSlug,
        title: plan.title,
        description: `Assinatura mensal - ${planSlug === "basic" ? "Basic" : "Pro"}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: plan.unit_price,
      },
    ],
    payer: {
      email: user.email ?? undefined,
    },
    back_urls: {
      success: `${baseUrl}/planos/sucesso`,
      failure: `${baseUrl}/planos/erro`,
      pending: `${baseUrl}/planos/pendente`,
    },
    auto_return: "approved" as const,
    external_reference: externalRef,
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Mercado Pago preference error:", res.status, err);
    return { error: "Não foi possível criar o checkout. Tente novamente." };
  }

  const data = (await res.json()) as { init_point?: string; sandbox_init_point?: string };
  const initPoint = process.env.NODE_ENV === "production" ? data.init_point : data.sandbox_init_point ?? data.init_point;
  if (!initPoint) return { error: "Resposta inválida do Mercado Pago." };

  return { error: null, initPoint };
}
