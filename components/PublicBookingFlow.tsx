"use client";

import { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import { Calendar, Users, Clock, FileText, CheckCircle2 } from "lucide-react";
import {
  getPublicBookingConfig,
  createPublicReservation,
  type PublicCompany,
  type PublicBookingConfig,
} from "@/app/actions/public-booking";

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

const STEPS = [
  { id: 1, label: "Data", icon: Calendar },
  { id: 2, label: "Pessoas", icon: Users },
  { id: 3, label: "Horário", icon: Clock },
  { id: 4, label: "Seus dados", icon: FileText },
];

type PublicBookingFlowProps = { initialCompany: PublicCompany };

export function PublicBookingFlow({ initialCompany }: PublicBookingFlowProps) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState<PublicBookingConfig | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    reservation_date: string;
    reservation_time: string;
    guestCount: number;
  } | null>(null);

  useEffect(() => {
    getPublicBookingConfig(initialCompany.id).then((c) => {
      setConfig(c);
      setLoadingConfig(false);
    });
  }, [initialCompany.id]);

  const closedSet = useMemo(() => new Set(config?.closedDates ?? []), [config?.closedDates]);
  const overridesByDate = useMemo(() => {
    const m = new Map<string, { open_time: string; close_time: string }>();
    (config?.dateHourOverrides ?? []).forEach((o) =>
      m.set(o.date, { open_time: o.open_time, close_time: o.close_time })
    );
    return m;
  }, [config?.dateHourOverrides]);

  const slots = useMemo(() => {
    if (!selectedDate || !config) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (closedSet.has(dateStr)) return [];
    const override = overridesByDate.get(dateStr);
    if (override) return generateTimeSlots(override.open_time, override.close_time);
    const dayOfWeek = selectedDate.getDay();
    const dayHours = config.weeklyHours[String(dayOfWeek)];
    if (!dayHours?.open || !dayHours?.close) return [];
    return generateTimeSlots(dayHours.open, dayHours.close);
  }, [selectedDate, closedSet, overridesByDate, config]);

  const disabledDays = useMemo(
    () => [
      (date: Date) => isBefore(date, startOfDay(new Date())),
      (date: Date) => closedSet.has(format(date, "yyyy-MM-dd")),
      (date: Date) => {
        const dayHours = config?.weeklyHours[String(date.getDay())];
        return dayHours == null;
      },
    ],
    [closedSet, config?.weeklyHours]
  );

  const currentStep = !selectedDate ? 1 : !selectedTime ? 3 : 4;

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
    const result = await createPublicReservation({
      companyId: initialCompany.id,
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      reservation_time: selectedTime,
      observation: observation.trim() || undefined,
      guest_count: guestCount,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess({
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      reservation_time: selectedTime,
      guestCount,
    });
    setGuestName("");
    setGuestPhone("");
    setGuestCount(1);
    setObservation("");
    setSelectedTime(null);
    setSelectedDate(null);
  }

  const cardClass = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#32C76A] focus:outline-none focus:ring-2 focus:ring-[#32C76A]/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  if (loadingConfig) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#32C76A]" />
        <p className="mt-3 text-sm text-gray-500">Carregando disponibilidade…</p>
      </div>
    );
  }

  if (success) {
    const whatsappUrl = initialCompany.whatsapp_number
      ? `https://wa.me/55${initialCompany.whatsapp_number.replace(/\D/g, "")}`
      : null;
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#32C76A]" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Reserva confirmada!</h2>
        <p className="mt-2 text-gray-600">
          {format(new Date(success.reservation_date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
          {" · "}{success.reservation_time}
          {" · "}{success.guestCount} {success.guestCount === 1 ? "pessoa" : "pessoas"}
        </p>
        <p className="mt-1 text-sm text-gray-500">{initialCompany.name}</p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            Falar no WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-4 block w-full text-sm text-gray-400 hover:text-gray-600"
        >
          Fazer outra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Indicador de passos */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const active = currentStep === step.id;
          const done = currentStep > step.id;
          return (
            <span
              key={step.id}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
                active
                  ? "text-white"
                  : done
                  ? "bg-gray-100 text-gray-500"
                  : "bg-gray-100 text-gray-400"
              }`}
              style={active ? { background: "#32C76A" } : {}}
            >
              <Icon className="h-4 w-4" />
              {step.label}
            </span>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Passo 1: Data */}
        <div className={`shrink-0 overflow-hidden ${cardClass}`}>
          <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Calendar className="h-5 w-5 text-[#32C76A]" />
            <span className="font-semibold text-gray-900">1. Escolha a data</span>
          </div>
          <DayPicker
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={(date) => {
              setSelectedDate(date ?? null);
              setSelectedTime(null);
            }}
            disabled={disabledDays}
            locale={ptBR}
            className="rdp-reservation rdp-reservation-light"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {/* Passo 2: Número de pessoas */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#32C76A]" />
              <span className="font-semibold text-gray-900">2. Número de pessoas</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGuestCount(n)}
                  className={`min-w-[3rem] rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    guestCount === n
                      ? "text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#32C76A]/40"
                  }`}
                  style={guestCount === n ? { background: "#32C76A" } : {}}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={99}
                value={guestCount > 10 ? guestCount : ""}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                placeholder="Outro"
                className="w-20 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#32C76A] focus:outline-none"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {guestCount} {guestCount === 1 ? "pessoa" : "pessoas"}
            </p>
          </div>

          {/* Passo 3: Horário */}
          {selectedDate && (
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#32C76A]" />
                <span className="font-semibold text-gray-900">
                  3. Horário — {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500">Este dia não tem horários disponíveis.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`min-w-[4.5rem] rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        selectedTime === time
                          ? "text-white"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-[#32C76A]/40"
                      }`}
                      style={selectedTime === time ? { background: "#32C76A" } : {}}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Passo 4: Dados */}
          <form onSubmit={handleSubmit} className={cardClass}>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="h-5 w-5 text-[#32C76A]" />
              <span className="font-semibold text-gray-900">4. Seus dados</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className={inputClass}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Observação</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Ex: data especial, restrições alimentares…"
                  rows={3}
                  maxLength={300}
                />
                <p className="mt-1 text-right text-xs text-gray-400">{observation.length}/300</p>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {!selectedDate && (
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                Selecione uma data no calendário para continuar.
              </p>
            )}
            {selectedDate && !selectedTime && (
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                Selecione um horário acima para continuar.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="mt-5 w-full rounded-xl py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "#32C76A" }}
            >
              {loading ? "Confirmando…" : "Confirmar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
