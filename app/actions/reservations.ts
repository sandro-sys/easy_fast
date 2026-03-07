"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getMyCompany } from "@/app/actions/companies";

export type ReservationStatus = "pre" | "confirmed" | "cancelled" | "completed" | "no_show";

export async function createReservation(data: {
  guest_name: string;
  guest_phone: string;
  observation: string;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  guest_count?: number;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const company = await getMyCompany();
  const guestCount = Math.max(1, Number(data.guest_count) || 1);

  const { error } = await supabase.from("reservations").insert({
    guest_name: data.guest_name,
    guest_phone: data.guest_phone,
    observation: data.observation || null,
    reservation_date: data.reservation_date,
    reservation_time: data.reservation_time,
    status: data.status,
    guest_count: guestCount,
    created_by: user.id,
    ...(company && { company_id: company.id }),
  });

  if (error) return { error: error.message };
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function getReservationsByDate(date: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  const company = await getMyCompany();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("reservation_date", date)
    .order("reservation_time");
  if (error) return [];
  const list = data ?? [];
  if (company && user) {
    return list.filter(
      (r) => r.company_id === company.id || (r.company_id == null && r.created_by === user.id)
    );
  }
  if (user) {
    return list.filter((r) => r.created_by === user.id);
  }
  return list;
}

/** Reservas em um intervalo de datas (inclusive), com mesmo filtro de empresa/usuário. */
export async function getReservationsByDateRange(dateFrom: string, dateTo: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  const company = await getMyCompany();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .gte("reservation_date", dateFrom)
    .lte("reservation_date", dateTo)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });
  if (error) return [];
  const list = data ?? [];
  if (company && user) {
    return list.filter(
      (r) => r.company_id === company.id || (r.company_id == null && r.created_by === user.id)
    );
  }
  if (user) {
    return list.filter((r) => r.created_by === user.id);
  }
  return list;
}

/** Soma de pessoas (guest_count) no dia, excluindo canceladas. */
export async function getTotalPeopleForDate(date: string): Promise<number> {
  const list = await getReservationsByDate(date);
  return list
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (Number((r as { guest_count?: number }).guest_count) || 1), 0);
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase
    .from("reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markAttendance(id: string, attended: boolean) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase
    .from("reservations")
    .update({
      attended,
      status: attended ? "completed" : "no_show",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/reservas");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function sendReminder(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data, error: fetchError } = await supabase
    .from("reservations")
    .select("guest_name, guest_phone, reservation_date, reservation_time")
    .eq("id", id)
    .single();

  if (fetchError || !data) return { error: "Reserva não encontrada" };

  const { error: updateError } = await supabase
    .from("reservations")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/reservas");

  const text = encodeURIComponent(
    `Olá ${data.guest_name}! Lembrete: sua reserva está marcada para ${data.reservation_date} às ${data.reservation_time}. Por favor confirme comparecimento ou cancele se não puder ir.`
  );
  const whatsappUrl = `https://wa.me/55${data.guest_phone.replace(/\D/g, "")}?text=${text}`;
  return { error: null, whatsappUrl };
}
