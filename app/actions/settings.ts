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
    .upsert({ key: "reservation_limit_per_slot", value: limit, updated_at: new Date().toISOString() }, { onConflict: "key" });

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
