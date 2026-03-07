"use client";

import { useState, useMemo } from "react";
import { format, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type ReservationItem = {
  id: string;
  guest_name: string;
  guest_phone?: string;
  observation?: string | null;
  reservation_date: string;
  reservation_time: string;
  status: string;
  attended: boolean | null;
  guest_count?: number;
};

interface WeekCalendarReservationsProps {
  weekStart: Date;
  weekEnd: Date;
  reservations: ReservationItem[];
}

export function WeekCalendarReservations({
  weekStart,
  weekEnd,
  reservations,
}: WeekCalendarReservationsProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = useMemo(() => {
    const d: { date: Date; dateStr: string }[] = [];
    let curr = weekStart;
    while (curr <= weekEnd) {
      d.push({ date: curr, dateStr: format(curr, "yyyy-MM-dd") });
      curr = addDays(curr, 1);
    }
    return d;
  }, [weekStart, weekEnd]);

  const byDay = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    const toDateStr = (d: string | Date): string =>
      typeof d === "string" ? d : format(d, "yyyy-MM-dd");
    reservations.forEach((r) => {
      const dateStr = toDateStr(r.reservation_date as string | Date);
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(r);
    });
    days.forEach(({ dateStr }) => {
      if (!map.has(dateStr)) map.set(dateStr, []);
    });
    return map;
  }, [reservations, days]);

  const selectedReservations = selectedDay ? (byDay.get(selectedDay) ?? []).sort(
    (a, b) => a.reservation_time.localeCompare(b.reservation_time)
  ) : [];

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold text-white">Reservas da semana</h2>
      <p className="mt-1 text-sm text-slate-400">
        Clique em um dia para ver as reservas.
      </p>
      <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3">
        {days.map(({ date, dateStr }) => {
          const list = byDay.get(dateStr) ?? [];
          const count = list.filter((r) => r.status !== "cancelled").length;
          const isSelected = selectedDay === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDay(dateStr)}
              className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                isSelected
                  ? "border-[#32C76A] bg-[#32C76A]/15 text-white"
                  : "border-white/15 bg-white/5 text-slate-300 hover:border-[#32C76A]/40 hover:bg-[#32C76A]/5"
              }`}
            >
              <span className="text-xs font-medium uppercase text-slate-500">
                {format(date, "EEE", { locale: ptBR })}
              </span>
              <span className="mt-1 text-lg font-semibold">{format(date, "d")}</span>
              <span className="mt-0.5 text-xs text-slate-400">{format(date, "MMM", { locale: ptBR })}</span>
              {count > 0 && (
                <span className="mt-1.5 rounded-full bg-[#32C76A]/20 px-2 py-0.5 text-xs font-medium text-[#32C76A]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <div className="card-soft mt-6 p-4">
          <h3 className="font-semibold text-white">
            Reservas do dia — {format(parseISO(selectedDay), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          {selectedReservations.length === 0 ? (
            <p className="mt-2 text-slate-400">Nenhuma reserva neste dia.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {selectedReservations.map((r) => (
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
                        <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                          Pré-reserva
                        </span>
                      )}
                      {r.attended === true && (
                        <span className="ml-2 rounded bg-[#32C76A]/20 px-1.5 py-0.5 text-xs text-[#32C76A]">
                          Compareceu
                        </span>
                      )}
                      {r.attended === false && (
                        <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                          Não compareceu
                        </span>
                      )}
                      {r.status === "cancelled" && (
                        <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                          Cancelada
                        </span>
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
      )}
    </div>
  );
}
