"use client";

import { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
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

export function PublicBookingFlow() {
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<PublicCompany | null>(null);
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
    getPublicCompanies().then((list) => {
      setCompanies(list);
      setLoadingCompanies(false);
    });
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedCompany || !selectedDate || !selectedTime) {
      setError("Selecione o restaurante, data e horário.");
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

  if (loadingCompanies) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-600/40 bg-[#1e242c] p-8 text-center">
        <p className="text-slate-400">Carregando restaurantes…</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-600/40 bg-[#1e242c] p-8 text-center">
        <p className="text-slate-400">Nenhum restaurante cadastrado no momento.</p>
      </div>
    );
  }

  if (success) {
    const whatsappUrl = success.whatsapp
      ? `https://wa.me/55${success.whatsapp.replace(/\D/g, "")}`
      : null;
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#32C76A]/40 bg-[#1e242c] p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Reserva confirmada</h2>
        <p className="mt-3 text-slate-300">
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
            setSelectedCompany(null);
            setConfig(null);
            setSelectedDate(null);
          }}
          className="mt-4 block w-full text-sm text-slate-400 hover:text-white"
        >
          Fazer outra reserva
        </button>
      </div>
    );
  }

  if (!selectedCompany || !config) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-center text-lg font-semibold text-white">Escolha o restaurante</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCompany(c)}
              className="rounded-xl border border-slate-600/40 bg-[#1e242c] p-5 text-left font-medium text-white shadow-lg transition hover:border-[#32C76A]/50 hover:bg-[#252b33]"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-slate-400">Restaurante:</span>
        <span className="font-semibold text-white">{selectedCompany.name}</span>
        <button
          type="button"
          onClick={() => {
            setSelectedCompany(null);
            setConfig(null);
            setSelectedDate(null);
            setSelectedTime(null);
          }}
          className="text-sm text-slate-400 underline hover:text-white"
        >
          Trocar
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="shrink-0 overflow-hidden rounded-xl border border-slate-600/40 bg-[#1e242c] p-5">
          <div className="mb-4 border-b border-white/10 pb-3">
            <span className="font-semibold text-white">Escolha a data</span>
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
            className="rdp-reservation"
          />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          {selectedDate && (
            <div className="rounded-xl border border-slate-600/40 bg-[#1e242c] p-5">
              <span className="font-semibold text-white">
                Horário para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
              {slots.length === 0 ? (
                <p className="mt-3 text-slate-400">Este dia está fechado ou não há horários configurados.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
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
            className="min-w-0 max-w-3xl rounded-xl border border-slate-600/40 bg-[#1e242c] p-6"
          >
            <h3 className="mb-4 border-b border-white/10 pb-4 text-lg font-semibold text-white">
              Dados da reserva
            </h3>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#32C76A]/50 focus:outline-none focus:ring-1 focus:ring-[#32C76A]/30"
                  placeholder="Seu nome"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#32C76A]/50 focus:outline-none focus:ring-1 focus:ring-[#32C76A]/30"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Número de pessoas</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-[#32C76A]/50 focus:outline-none focus:ring-1 focus:ring-[#32C76A]/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Observação</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="min-h-[88px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#32C76A]/50 focus:outline-none focus:ring-1 focus:ring-[#32C76A]/30"
                  placeholder="Ex.: mesa perto da janela..."
                  rows={3}
                />
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {!selectedDate && (
              <p className="mt-4 text-sm text-amber-400/90">Selecione uma data no calendário.</p>
            )}
            {selectedDate && !selectedTime && (
              <p className="mt-4 text-sm text-amber-400/90">Selecione um horário para ativar o botão.</p>
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
