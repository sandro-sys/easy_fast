"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { DayHours, WeeklyHours } from "@/app/actions/settings";

export type PublicCompany = { id: string; name: string };

/** Lista empresas (restaurantes) para o cliente escolher na página pública. */
export async function getPublicCompanies(): Promise<PublicCompany[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");
  if (error) return [];
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}

/** Dados do restaurante para exibir na confirmação (nome, WhatsApp). */
export async function getPublicCompanyById(companyId: string): Promise<{ name: string; whatsapp_number: string | null } | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("companies")
    .select("name, whatsapp_number")
    .eq("id", companyId)
    .single();
  return data ? { name: data.name, whatsapp_number: data.whatsapp_number ?? null } : null;
}

export type PublicBookingConfig = {
  weeklyHours: WeeklyHours;
  closedDates: string[];
  dateHourOverrides: { date: string; open_time: string; close_time: string }[];
  limitPerSlot: number;
  maxPeoplePerDay: number;
};

const defaultDay: DayHours = { open: "12:00", close: "23:00" };
function defaultWeeklyHours(): WeeklyHours {
  const h: WeeklyHours = {};
  for (let i = 0; i <= 6; i++) h[String(i)] = i === 0 ? null : defaultDay;
  return h;
}

/** Configuração de dias/horários para a página pública (global; depois pode ser por company_id). */
export async function getPublicBookingConfig(_companyId?: string): Promise<PublicBookingConfig> {
  const supabase = createAdminClient();
  if (!supabase) {
    return {
      weeklyHours: defaultWeeklyHours(),
      closedDates: [],
      dateHourOverrides: [],
      limitPerSlot: 10,
      maxPeoplePerDay: 0,
    };
  }

  const [settingsRes, closedRes, overridesRes] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase.from("closed_dates").select("date"),
    supabase.from("date_hour_overrides").select("date, open_time, close_time"),
  ]);

  const settings: Record<string, string> = {};
  settingsRes.data?.forEach(({ key, value }) => {
    if (value != null) settings[key] = String(value);
  });
  const closedDates = (closedRes.data ?? []).map((r) => (typeof r.date === "string" ? r.date : String(r.date)));
  const dateHourOverrides = (overridesRes.data ?? []).map((r) => ({
    date: typeof r.date === "string" ? r.date : String(r.date),
    open_time: r.open_time,
    close_time: r.close_time,
  }));

  let weeklyHours: WeeklyHours = defaultWeeklyHours();
  const wh = settings["weekly_hours"];
  if (wh) {
    try {
      const parsed = JSON.parse(wh) as Record<string, unknown>;
      const out: WeeklyHours = {};
      for (let i = 0; i <= 6; i++) {
        const v = parsed[String(i)];
        out[String(i)] =
          v && typeof v === "object" && "open" in v && "close" in v
            ? { open: (v as { open: string }).open, close: (v as { close: string }).close }
            : null;
      }
      weeklyHours = out;
    } catch {
      /* keep default */
    }
  }

  const limitPerSlot = Math.max(1, Number(settings["reservation_limit_per_slot"]) || 10);
  const maxPeoplePerDay = Math.max(0, Number(settings["max_people_per_day"]) || 0);

  return {
    weeklyHours,
    closedDates,
    dateHourOverrides,
    limitPerSlot,
    maxPeoplePerDay,
  };
}

/** Conta reservas (não canceladas) no slot para a empresa. */
export async function getReservationCountForSlot(
  companyId: string,
  date: string,
  time: string
): Promise<number> {
  const supabase = createAdminClient();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("reservation_date", date)
    .eq("reservation_time", time)
    .neq("status", "cancelled");
  if (error) return 0;
  return count ?? 0;
}

/** Total de pessoas reservadas no dia para a empresa (para limite do dia). */
export async function getTotalPeopleForDateByCompany(companyId: string, date: string): Promise<number> {
  const supabase = createAdminClient();
  if (!supabase) return 0;
  const { data } = await supabase
    .from("reservations")
    .select("guest_count")
    .eq("company_id", companyId)
    .eq("reservation_date", date)
    .neq("status", "cancelled");
  const list = data ?? [];
  return list.reduce((sum, r) => sum + (Number((r as { guest_count?: number }).guest_count) || 1), 0);
}

/** Cria reserva pela página pública (cliente não logado). */
export async function createPublicReservation(data: {
  companyId: string;
  guest_name: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  observation?: string;
  guest_count?: number;
}): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Serviço indisponível." };

  const config = await getPublicBookingConfig(data.companyId);
  const count = await getReservationCountForSlot(data.companyId, data.reservation_date, data.reservation_time);
  if (count >= config.limitPerSlot) return { error: "Este horário não está mais disponível." };

  const guestCount = Math.max(1, Number(data.guest_count) || 1);
  if (config.maxPeoplePerDay > 0) {
    const total = await getTotalPeopleForDateByCompany(data.companyId, data.reservation_date);
    if (total + guestCount > config.maxPeoplePerDay) return { error: "Limite de pessoas do dia atingido." };
  }

  const { error } = await supabase.from("reservations").insert({
    company_id: data.companyId,
    guest_name: data.guest_name.trim(),
    guest_phone: data.guest_phone.trim(),
    observation: (data.observation || "").trim() || null,
    reservation_date: data.reservation_date,
    reservation_time: data.reservation_time,
    status: "confirmed",
    created_by: null,
    guest_count: guestCount,
  });

  if (error) return { error: error.message };
  return { error: null };
}
