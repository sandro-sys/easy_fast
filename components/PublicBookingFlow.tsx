"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import { Calendar, Users, Clock, FileText } from "lucide-react";
import {
  getPublicCompanies,
  getPublicBookingConfig,
  createPublicReservation,
  getPublicCompanyById,
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

type PublicBookingFlowProps = { initialCompany?: PublicCompany };

export function PublicBookingFlow({ initialCompany }: PublicBookingFlowProps = {}) {
  const [companies, setCompanies] = useState<PublicCompany[]>(initialCompany ? [initialCompany] : []);
  const [loadingCompanies, setLoadingCompanies] = useState(!initialCompany);
  const [loadingConfig, setLoadingConfig] = useState(!!initialCompany);
  const [selectedCompany, setSelectedCompany] = useState<PublicCompany | null>(initialCompany ?? null);
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
    companyName: string;
    whatsapp: string | null;
    reservation_date: string;
    reservation_time: string;
  } | null>(null);

  useEffect(() => {
    if (initialCompany) {
      setLoadingConfig(true);
      getPublicBookingConfig(initialCompany.id).then((c) => {
        setConfig(c);
        setLoadingConfig(false);
      });
      return;
    }
    getPublicCompanies().then((list) => {
      setCompanies(list);
      setLoadingCompanies(false);
    });
  }, [initialCompany]);

  const handleSelectCompany = async (company: PublicCompany) => {
    setError("");
    setSelectedCompany(company);
    const c = await getPublicBookingConfig(company.id);
    setConfig(c);
    setSelectedDate(null);
    setSelectedTime(null);
  };

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
    if (!selectedCompany || !selectedDate || !selectedTime) {
      setError("Selecione data e horário.");
      return;
    }
    if (!guestName.trim() || !guestPhone.trim()) {
      setError("Nome e telefone são obrigatórios.");
      return;
    }
    setLoading(true);
    const result = await createPublicReservation({
      companyId: selectedCompany.id,
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
    const companyInfo = await getPublicCompanyById(selectedCompany.id);
    setSuccess({
      companyName: companyInfo?.name ?? selectedCompany.name,
      whatsapp: companyInfo?.whatsapp_number ?? null,
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      reservation_time: selectedTime,
    });
    setGuestName("");
    setGuestPhone("");
    setGuestCount(1);
    setObservation("");
    setSelectedTime(null);
  }

  const cardClass = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#32C76A] focus:outline-none focus:ring-2 focus:ring-[#32C76A]/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  if (loadingCompanies || (initialCompany && loadingConfig)) {
    return (
      <div className={`mx-auto max-w-2xl ${cardClass} p-8 text-center`}>
        <p className="text-gray-500">{initialCompany ? "Carregando…" : "Carregando restaurantes…"}</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className={`mx-auto max-w-2xl ${cardClass} p-8 text-center`}>
        <p className="text-gray-500">Nenhum restaurante cadastrado no momento.</p>
      </div>
    );
  }

  if (success) {
    const whatsappUrl = success.whatsapp
      ? `https://wa.me/55${success.whatsapp.replace(/\D/g, "")}`
      : null;
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#32C76A]/30 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Reserva confirmada</h2>
        <p className="mt-3 text-gray-600">
          Sua reserva no <strong>{success.companyName}</strong> foi agendada para{" "}
          {format(new Date(success.reservation_date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })} às{" "}
          {success.reservation_time}.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-[#25D366] px-6 py-3 font-medium text-white hover:bg-[#20bd5a]"
          >
            Falar no WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setSelectedDate(null);
            setSelectedTime(null);
            if (!initialCompany) {
              setSelectedCompany(null);
              setConfig(null);
            }
          }}
          className="mt-4 block w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Fazer outra reserva
        </button>
      </div>
    );
  }

  if (!selectedCompany || !config) {
    if (initialCompany) return null;
    const reserveUrl = (c: PublicCompany) => `/reservar/${c.slug || c.id}`;
    return (
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">Escolha o restaurante</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={reserveUrl(c)}
              className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-[#32C76A]/40 hover:shadow-md"
            >
              <div className="relative h-32 overflow-hidden bg-gray-200">
                {c.cover_image_url ? (
                  <img
                    src={c.cover_image_url}
                    alt={c.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">{c.name}</div>
                )}
              </div>
              <div className="p-4">
                <span className="font-semibold text-gray-900 group-hover:text-[#32C76A]">{c.name}</span>
                <p className="mt-1 text-sm text-gray-500">Reservar mesa →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-gray-500">Restaurante:</span>
        <span className="font-semibold text-gray-900">{selectedCompany.name}</span>
        {!initialCompany && (
          <button
            type="button"
            onClick={() => {
              setSelectedCompany(null);
              setConfig(null);
              setSelectedDate(null);
              setSelectedTime(null);
            }}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Trocar
          </button>
        )}
        {initialCompany && (
          <Link href="/reservar" className="text-sm font-medium text-[#32C76A] hover:text-[#28a745]">
            Ver outros restaurantes
          </Link>
        )}
      </div>

      {/* Indicador de passos */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const active = currentStep === step.id;
          const done = currentStep > step.id;
          return (
            <span
              key={step.id}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                active ? "bg-[#32C76A] text-white" : done ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              {step.label}
            </span>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* Passo 1: Data */}
        <div className={`shrink-0 overflow-hidden ${cardClass}`}>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
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

        <div className="flex flex-1 flex-col gap-6">
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
                      ? "bg-[#32C76A] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#32C76A]/40"
                  }`}
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
            <p className="mt-2 text-sm text-gray-500">{guestCount} {guestCount === 1 ? "pessoa" : "pessoas"}</p>
          </div>

          {/* Passo 3: Horário */}
          {selectedDate && (
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#32C76A]" />
                <span className="font-semibold text-gray-900">
                  3. Horário para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="text-gray-500">Este dia está fechado ou não há horários configurados.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`min-w-[4rem] rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        selectedTime === time
                          ? "bg-[#32C76A] text-white"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-[#32C76A]/40"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Passo 4: Dados e observação */}
          <form onSubmit={handleSubmit} className={`min-w-0 max-w-3xl ${cardClass}`}>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <FileText className="h-5 w-5 text-[#32C76A]" />
              <h3 className="text-lg font-semibold text-gray-900">4. Seus dados e observação</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
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
                <label className={labelClass}>Alguma observação?</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className={`${inputClass} min-h-[88px] resize-y`}
                  placeholder="Ex: data especial, restrições alimentares..."
                  rows={3}
                  maxLength={300}
                />
                <p className="mt-1 text-right text-xs text-gray-500">{observation.length}/300</p>
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {!selectedDate && (
              <p className="mt-4 text-sm text-gray-600">Selecione uma data no calendário.</p>
            )}
            {selectedDate && !selectedTime && (
              <p className="mt-4 text-sm text-gray-600">Selecione um horário.</p>
            )}
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="mt-6 w-full rounded-xl bg-[#32C76A] py-3.5 text-base font-semibold text-white transition hover:bg-[#2ab52b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Confirmar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
