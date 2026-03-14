"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getReservationsByDate,
  updateReservationStatus,
  markAttendance,
  sendReminder,
} from "@/app/actions/reservations";

interface Reservation {
  id: string;
  guest_name: string;
  guest_phone: string;
  observation: string | null;
  reservation_time: string;
  status: string;
  attended: boolean | null;
  reminder_sent_at: string | null;
  guest_count?: number;
}

interface ReservationsListProps {
  selectedDate: string | null;
  onUpdate: () => void;
  refreshKey?: number;
}

export function ReservationsList({ selectedDate, onUpdate, refreshKey = 0 }: ReservationsListProps) {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setList([]);
      return;
    }
    setLoading(true);
    getReservationsByDate(selectedDate).then((data) => {
      setList(data as Reservation[]);
      setLoading(false);
    });
  }, [selectedDate, refreshKey]);

  async function handleCancel(id: string) {
    await updateReservationStatus(id, "cancelled");
    setList((prev) => prev.filter((r) => r.id !== id));
    onUpdate();
  }

  async function handleAttendance(id: string, attended: boolean) {
    await markAttendance(id, attended);
    setList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, attended, status: attended ? "completed" : "no_show" } : r
      )
    );
    onUpdate();
  }

  async function handleReminder(id: string) {
    const result = await sendReminder(id);
    if (result?.whatsappUrl) {
      setWhatsappUrl(result.whatsappUrl);
      window.open(result.whatsappUrl, "_blank");
    }
    onUpdate();
  }

  if (!selectedDate) return null;
  if (loading) return <p className="text-slate-400">Carregando…</p>;

  return (
    <div className="card mt-6">
      <h3 className="font-semibold text-[#32C76A]">
        Reservas do dia — {format(new Date(selectedDate), "EEEE, d MMM", { locale: ptBR })}
      </h3>
      {list.length === 0 ? (
        <p className="mt-2 text-slate-400">Nenhuma reserva neste dia.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border p-3 ${
                r.status === "cancelled" ? "border-white/10 bg-white/5 opacity-75" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-100">{r.guest_name}</span>
                  <span className="mx-2 text-slate-500">•</span>
                  <span className="text-slate-400">{r.reservation_time}</span>
                  {(r.guest_count ?? 1) > 1 && (
                    <span className="ml-2 text-slate-500">({r.guest_count} pessoas)</span>
                  )}
                  {r.status === "pre" && (
                    <span className="ml-2 rounded bg-slate-500/20 px-1.5 py-0.5 text-xs text-slate-300">
                      Pré-reserva
                    </span>
                  )}
                  {r.status === "cancelled" && (
                    <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                      Cancelada
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.status !== "cancelled" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAttendance(r.id, true)}
                        className="rounded-lg bg-[#32C76A]/20 px-2 py-1 text-xs font-medium text-[#32C76A] hover:bg-[#32C76A]/30"
                      >
                        Compareceu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendance(r.id, false)}
                        className="rounded-lg bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30"
                      >
                        Não compareceu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReminder(r.id)}
                        className="rounded-lg bg-[#32C76A]/20 px-2 py-1 text-xs font-medium text-[#32C76A] hover:bg-[#32C76A]/30"
                      >
                        Lembrete WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(r.id)}
                        className="rounded-lg bg-slate-500/30 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-500/50"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
              {r.observation && (
                <p className="mt-1 text-sm text-slate-500">{r.observation}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
