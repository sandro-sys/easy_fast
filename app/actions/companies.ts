"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isMasterUser } from "@/lib/auth-utils";
import { nameToSlug, ensureUniqueSlug } from "@/lib/slug";

export type CompanyInput = {
  name: string;
  cnpj: string;
  address: string;
  whatsapp_number: string;
  cover_image_url?: string;
};

export async function createCompany(data: CompanyInput) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const existing = await supabase.from("companies").select("slug");
  const slugs = new Set((existing.data ?? []).map((r) => (r as { slug?: string }).slug).filter(Boolean) as string[]);
  const slug = ensureUniqueSlug(nameToSlug(data.name.trim()), slugs);

  const { error } = await supabase.from("companies").insert({
    name: data.name.trim(),
    slug,
    cnpj: data.cnpj.replace(/\D/g, "").slice(0, 14) || null,
    address: data.address.trim() || null,
    whatsapp_number: data.whatsapp_number.replace(/\D/g, "").slice(0, 20) || null,
    cover_image_url: (data.cover_image_url ?? "").trim() || null,
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
    .select("id, name, whatsapp_number, approved, slug, cover_image_url")
    .eq("owner_id", user.id)
    .single();
  return data
    ? {
        id: data.id,
        name: data.name,
        whatsapp_number: (data as { whatsapp_number?: string | null }).whatsapp_number ?? null,
        approved: (data as { approved?: boolean }).approved ?? false,
        slug: (data as { slug?: string | null }).slug ?? null,
        cover_image_url: (data as { cover_image_url?: string | null }).cover_image_url ?? null,
      }
    : null;
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

export type CompanyProfileUpdate = {
  name?: string;
  slug?: string;
  cover_image_url?: string | null;
};

/** Dono atualiza nome, slug e/ou foto de capa da própria empresa. */
export async function updateCompanyProfile(companyId: string, data: CompanyProfileUpdate): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.cover_image_url !== undefined) payload.cover_image_url = (data.cover_image_url ?? "").trim() || null;
  if (data.slug !== undefined) {
    const slug = (data.slug ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || null;
    if (slug) payload.slug = slug;
  }

  const { error } = await supabase.from("companies").update(payload).eq("id", companyId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes");
  revalidatePath("/reservar");
  return { error: null };
}

/** Gera e salva slug a partir do nome da empresa (para empresas que ainda não têm slug). */
export async function ensureCompanySlug(companyId: string): Promise<{ error: string | null; slug?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: company } = await supabase
    .from("companies")
    .select("name, slug")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .single();
  if (!company) return { error: "Empresa não encontrada" };
  const currentSlug = (company as { slug?: string | null }).slug;
  if (currentSlug) return { error: null, slug: currentSlug };

  const existing = await supabase.from("companies").select("slug");
  const slugs = new Set((existing.data ?? []).map((r) => (r as { slug?: string }).slug).filter(Boolean) as string[]);
  const slug = ensureUniqueSlug(nameToSlug((company as { name: string }).name), slugs);

  const { error } = await supabase
    .from("companies")
    .update({ slug, updated_at: new Date().toISOString() })
    .eq("id", companyId)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes");
  return { error: null, slug };
}
