"use client";

import { useState, useMemo, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import { createReservation } from "@/app/actions/reservations";
import { WhatsAppModal } from "./WhatsAppModal";
import { ReservationsList } from "./ReservationsList";
import type { WeeklyHours } from "@/app/actions/settings";

const SLOT_MINUTES = 30;

function generateTimeSlots(open: string, close: string): string[] {
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const slots: string[] = [];
  let h = oh;
  let m = om;
  while (h < ch || (h === ch && m < cm)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += SLOT_MINUTES;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return slots;
}

type DateHourOverride = { date: string; open_time: string; close_time: string };

interface ReservationCalendarProps {
  limitPerSlot: number;
  closedDates: string[];
  companyWhatsapp?: string | null;
  weeklyHours?: WeeklyHours;
  dateHourOverrides?: DateHourOverride[];
}

export function ReservationCalendar({
  limitPerSlot,
  closedDates,
  companyWhatsapp,
  weeklyHours = {},
  dateHourOverrides = [],
}: ReservationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [observation, setObservation] = useState("");
  const [isPreReservation, setIsPreReservation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{
    guest_name: string;
    guest_phone: string;
    reservation_date: string;
    reservation_time: string;
    observation: string | null;
  } | null>(null);

  const closedSet = useMemo(() => new Set(closedDates), [closedDates]);
  const overridesByDate = useMemo(() => {
    const m = new Map<string, { open_time: string; close_time: string }>();
    dateHourOverrides.forEach((o) => m.set(o.date, { open_time: o.open_time, close_time: o.close_time }));
    return m;
  }, [dateHourOverrides]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (closedSet.has(dateStr)) return [];
    const override = overridesByDate.get(dateStr);
    if (override) return generateTimeSlots(override.open_time, override.close_time);
    const dayOfWeek = selectedDate.getDay();
    const dayHours = weeklyHours[String(dayOfWeek)];
    if (!dayHours?.open || !dayHours?.close) return [];
    return generateTimeSlots(dayHours.open, dayHours.close);
  }, [selectedDate, closedSet, overridesByDate, weeklyHours]);

  const disabledDays = useMemo(
    () => [
      (date: Date) => isBefore(date, startOfDay(new Date())),
      (date: Date) => closedSet.has(format(date, "yyyy-MM-dd")),
      (date: Date) => {
        const dayHours = weeklyHours[String(date.getDay())];
        return dayHours == null;
      },
    ],
    [closedSet, weeklyHours]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedDate || !selectedTime) {
      setError("Selecione data e horário.");
      return;
    }
    if (!guestName.trim() || !guestPhone.trim()) {
      setError("Nome e telefone são obrigatórios.");
      return;
    }
    setLoading(true);
    const result = await createReservation({
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      observation: observation.trim() || "",
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      reservation_time: selectedTime,
      status: isPreReservation ? "pre" : "confirmed",
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccessData({
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      reservation_time: selectedTime,
      observation: observation.trim() || null,
    });
    setGuestName("");
    setGuestPhone("");
    setObservation("");
    setSelectedTime(null);
  }

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshList = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      {/* Calendário */}
      <div className="card-soft reservation-calendar-card shrink-0 overflow-hidden p-5">
        <div className="mb-4 border-b border-white/10 pb-3">
          <span className="font-semibold text-white">Escolha a data</span>
        </div>
        <DayPicker
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(date) => setSelectedDate(date ?? null)}
          disabled={disabledDays}
          locale={ptBR}
          className="rdp-reservation"
          required={false}
        />
      </div>

      {/* Horários + Formulário */}
      <div className="flex flex-1 flex-col gap-6">
        {selectedDate && (
          <div className="card-soft p-5">
            <div className="mb-3">
              <span className="font-semibold text-white">
                Horário para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            {slots.length === 0 ? (
              <p className="text-slate-400">Este dia está fechado ou não há horários configurados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`min-w-[4rem] rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedTime === time
                        ? "bg-[#32C76A] text-white"
                        : "border border-white/15 bg-white/5 text-slate-200 hover:border-[#32C76A]/40 hover:bg-[#32C76A]/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="card-soft reservation-form-card min-w-0 w-full max-w-3xl p-6"
        >
          <div className="mb-6 border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-white">Dados da reserva</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nome <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="input-field-modern"
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Telefone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="input-field-modern"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Observação
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="input-field-modern min-h-[88px] resize-y"
                placeholder="Ex.: mesa perto da janela, aniversariante..."
                rows={3}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
              <input
                type="checkbox"
                checked={isPreReservation}
                onChange={(e) => setIsPreReservation(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 text-[#32C76A] focus:ring-[#32C76A]/30"
              />
              <span className="text-sm font-medium text-slate-300">Pré-reserva</span>
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {!selectedDate && (
            <p className="mt-4 text-sm text-amber-400/90">
              Selecione uma data no calendário à esquerda.
            </p>
          )}
          {selectedDate && !selectedTime && (
            <p className="mt-4 text-sm text-amber-400/90">
              Selecione um horário na lista acima (ex.: 12:00, 12:30) para ativar o botão.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime}
            className="btn-reservation mt-6 w-full rounded-xl py-3.5 text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={!selectedDate ? "Selecione uma data" : !selectedTime ? "Selecione um horário" : undefined}
          >
            {loading ? "Salvando…" : "Concluir reserva"}
          </button>
        </form>
      </div>

      <div className="w-full lg:max-w-sm">
        <ReservationsList selectedDate={dateStr} onUpdate={refreshList} refreshKey={refreshKey} />
      </div>
      {successData && (
        <WhatsAppModal
          data={successData}
          companyWhatsapp={companyWhatsapp ?? null}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
}
