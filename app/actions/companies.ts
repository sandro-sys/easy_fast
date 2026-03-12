"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isMasterUser } from "@/lib/auth-utils";

export type CompanyInput = {
  name: string;
  cnpj: string;
  address: string;
  whatsapp_number: string;
};

export async function createCompany(data: CompanyInput) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("companies").insert({
    name: data.name.trim(),
    cnpj: data.cnpj.replace(/\D/g, "").slice(0, 14) || null,
    address: data.address.trim() || null,
    whatsapp_number: data.whatsapp_number.replace(/\D/g, "").slice(0, 20) || null,
    owner_id: user.id,
    owner_email: user.email ?? null,
    plan_slug: "trial",
    approved: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/reservas");
  revalidatePath("/configuracoes");
  return { error: null };
}

export async function getMyCompany(): Promise<{
  id: string;
  name: string;
  whatsapp_number?: string | null;
  approved?: boolean;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("companies")
    .select("id, name, whatsapp_number, approved")
    .eq("owner_id", user.id)
    .single();
  return data ?? null;
}

export type CompanyWithMetrics = {
  id: string;
  name: string;
  cnpj: string | null;
  address: string | null;
  whatsapp_number: string | null;
  owner_id: string;
  owner_email: string | null;
  plan_slug: string;
  created_at: string;
  reservation_count: number;
  approved: boolean;
};

/** Apenas para usuário master: lista empresas e contagem de reservas. */
export async function getAdminMetrics(): Promise<{
  companies: CompanyWithMetrics[];
  totalReservations: number;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isMasterUser(user.email)) return null;

  const { data: companies, error: errCompanies } = await supabase
    .from("companies")
    .select("id, name, cnpj, address, whatsapp_number, owner_id, owner_email, plan_slug, created_at, approved")
    .order("created_at", { ascending: false });
  if (errCompanies || !companies) return { companies: [], totalReservations: 0 };

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, company_id, created_by");
  const countByCompanyId: Record<string, number> = {};
  const countByOwnerId: Record<string, number> = {};
  (reservations ?? []).forEach((r) => {
    if (r.company_id) {
      countByCompanyId[r.company_id] = (countByCompanyId[r.company_id] ?? 0) + 1;
    } else {
      countByOwnerId[r.created_by] = (countByOwnerId[r.created_by] ?? 0) + 1;
    }
  });

  const companiesWithMetrics: CompanyWithMetrics[] = companies.map((c) => ({
    ...c,
    owner_email: (c as { owner_email?: string | null }).owner_email ?? null,
    plan_slug: (c as { plan_slug?: string }).plan_slug ?? "trial",
    reservation_count: (countByCompanyId[c.id] ?? 0) + (countByOwnerId[c.owner_id] ?? 0),
    approved: (c as { approved?: boolean }).approved ?? false,
  }));
  const totalReservations = companiesWithMetrics.reduce((s, c) => s + c.reservation_count, 0);

  return { companies: companiesWithMetrics, totalReservations };
}

/** Apenas master: aprovar empresa para liberar uso do sistema. */
export async function approveCompany(companyId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isMasterUser(user.email)) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("companies")
    .update({ approved: true, updated_at: new Date().toISOString() })
    .eq("id", companyId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/aguardando-aprovacao");
  return { error: null };
}
