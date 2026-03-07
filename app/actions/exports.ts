"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getMyCompany } from "@/app/actions/companies";
import { getReservationsByDateRange } from "@/app/actions/reservations";

type ReservationRow = {
  id: string;
  guest_name: string;
  guest_phone: string;
  observation: string | null;
  reservation_date: string;
  reservation_time: string;
  status: string;
  attended: boolean | null;
  guest_count?: number;
  created_at: string | null;
};

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value).replace(/"/g, '""');
  return s.includes(";") || s.includes('"') || s.includes("\n") || s.includes("\r") ? `"${s}"` : s;
}

function buildCsv(rows: ReservationRow[]): string {
  const header = "Data;Horário;Nome;Telefone;Pessoas;Status;Compareceu;Observação;Exportado em";
  const lines = rows.map((r) => {
    const date = r.reservation_date ?? "";
    const time = r.reservation_time ?? "";
    const name = escapeCsvField(r.guest_name);
    const phone = escapeCsvField(r.guest_phone);
    const people = String(r.guest_count ?? 1);
    const status = escapeCsvField(r.status);
    const attended = r.attended === true ? "Sim" : r.attended === false ? "Não" : "";
    const obs = escapeCsvField(r.observation);
    const createdAt = r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : "";
    return [date, time, name, phone, people, status, attended, obs, createdAt].map(escapeCsvField).join(";");
  });
  return [header, ...lines].join("\r\n");
}

export async function exportReservationsAsCsv(dateFrom: string, dateTo: string): Promise<{
  error: string | null;
  csv?: string;
  count?: number;
  filename?: string;
}> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const company = await getMyCompany();

  const list = await getReservationsByDateRange(dateFrom, dateTo);
  const count = list.length;
  const csv = buildCsv(list as ReservationRow[]);

  const { error } = await supabase.from("export_history").insert({
    created_by: user.id,
    company_id: company?.id ?? null,
    date_from: dateFrom,
    date_to: dateTo,
    total_rows: count,
  });

  if (error) return { error: error.message };
  revalidatePath("/exportar");

  const filename = `reservas-${dateFrom}-${dateTo}.csv`;
  return { error: null, csv, count, filename };
}

export type ExportHistoryItem = {
  id: string;
  date_from: string;
  date_to: string;
  total_rows: number;
  created_at: string;
};

export async function getExportHistory(): Promise<ExportHistoryItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("export_history")
    .select("id, date_from, date_to, total_rows, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    date_from: typeof r.date_from === "string" ? r.date_from : (r.date_from as unknown as string),
    date_to: typeof r.date_to === "string" ? r.date_to : (r.date_to as unknown as string),
    total_rows: Number(r.total_rows) || 0,
    created_at: r.created_at ?? "",
  }));
}
