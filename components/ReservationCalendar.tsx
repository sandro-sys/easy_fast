"use client";

import { useState, useMemo, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Phone, MessageSquare } from "lucide-react";
import "react-day-picker/style.css";
import { createReservation } from "@/app/actions/reservations";
import { WhatsAppModal } from "./WhatsAppModal";
import { ReservationsList } from "./ReservationsList";

const DEFAULT_OPEN = "12:00";
const DEFAULT_CLOSE = "23:00";
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

interface ReservationCalendarProps {
  limitPerSlot: number;
  closedDates: string[];
}

export function ReservationCalendar({ limitPerSlot, closedDates }: ReservationCalendarProps) {
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

  const slots = useMemo(
    () => generateTimeSlots(DEFAULT_OPEN, DEFAULT_CLOSE),
    []
  );

  const closedSet = useMemo(() => new Set(closedDates), [closedDates]);

  const disabledDays = useMemo(
    () => [
      (date: Date) => isBefore(date, startOfDay(new Date())),
      (date: Date) => closedSet.has(format(date, "yyyy-MM-dd")),
    ],
    [closedSet]
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
      <div className="reservation-calendar-card shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#22252a] p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#32C76A]/20">
            <Calendar className="h-5 w-5 text-[#32C76A]" />
          </div>
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
          <div className="rounded-2xl border border-white/10 bg-[#22252a] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#32C76A]/20">
                <Clock className="h-5 w-5 text-[#32C76A]" />
              </div>
              <span className="font-semibold text-white">
                Horário para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
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
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="reservation-form-card rounded-2xl border border-white/10 bg-[#22252a] p-6"
        >
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#32C76A]/20">
              <User className="h-5 w-5 text-[#32C76A]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Dados da reserva</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <User className="h-4 w-4 text-slate-500" />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Phone className="h-4 w-4 text-slate-500" />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <MessageSquare className="h-4 w-4 text-slate-500" />
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

          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime}
            className="btn-reservation mt-6 w-full rounded-xl py-3.5 text-base font-semibold transition disabled:opacity-50"
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
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
}
