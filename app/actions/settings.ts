"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function getSettings() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) return null;
  const map: Record<string, unknown> = {};
  data?.forEach(({ key, value }) => (map[key] = value));
  return map;
}

export async function setReservationLimit(limit: number) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "reservation_limit_per_slot", value: String(limit), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}

export async function addClosedDate(date: string, reason: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase.from("closed_dates").insert({ date, reason: reason || null });

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}

export async function removeClosedDate(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase.from("closed_dates").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}

export async function getClosedDates(): Promise<{ id: string; date: string; reason: string | null }[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("closed_dates")
    .select("id, date, reason")
    .order("date", { ascending: false });
  return (data ?? []).map(({ id, date, reason }) => ({ id, date, reason }));
}

export type DayHours = { open: string; close: string } | null;
export type WeeklyHours = Record<string, DayHours>;

const DEFAULT_DAY: DayHours = { open: "12:00", close: "23:00" };

export async function getWeeklyHours(): Promise<WeeklyHours> {
  const supabase = await createClient();
  if (!supabase) return defaultWeeklyHours();
  const { data } = await supabase.from("settings").select("value").eq("key", "weekly_hours").single();
  if (!data?.value) return defaultWeeklyHours();
  try {
    const parsed = JSON.parse(data.value as string) as Record<string, unknown>;
    const out: WeeklyHours = {};
    for (let i = 0; i <= 6; i++) {
      const v = parsed[String(i)];
      out[String(i)] = v && typeof v === "object" && "open" in v && "close" in v
        ? { open: (v as { open: string }).open, close: (v as { close: string }).close }
        : null;
    }
    return out;
  } catch {
    return defaultWeeklyHours();
  }
}

function defaultWeeklyHours(): WeeklyHours {
  const h: WeeklyHours = {};
  for (let i = 0; i <= 6; i++) h[String(i)] = i === 0 ? null : DEFAULT_DAY;
  return h;
}

export async function setWeeklyHours(hours: WeeklyHours) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "weekly_hours", value: JSON.stringify(hours), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}

export async function getDateHourOverrides(): Promise<{ id: string; date: string; open_time: string; close_time: string }[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("date_hour_overrides")
    .select("id, date, open_time, close_time")
    .order("date", { ascending: false });
  return (data ?? []).map(({ id, date, open_time, close_time }) => ({
    id,
    date: typeof date === "string" ? date : (date as unknown as string),
    open_time,
    close_time,
  }));
}

export async function addDateHourOverride(date: string, openTime: string, closeTime: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase
    .from("date_hour_overrides")
    .upsert(
      { date, open_time: openTime, close_time: closeTime },
      { onConflict: "date" }
    );
  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}

export async function removeDateHourOverride(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase.from("date_hour_overrides").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/reservas");
  return { error: null };
}
