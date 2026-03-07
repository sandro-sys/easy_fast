"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import {
  getWeeklyHours,
  setWeeklyHours,
  type WeeklyHours,
  type DayHours,
  getClosedDates,
  addClosedDate,
  removeClosedDate,
  getDateHourOverrides,
  addDateHourOverride,
  removeDateHourOverride,
} from "@/app/actions/settings";

export function OpeningHoursConfig() {
  const [weeklyHours, setWeeklyHoursState] = useState<WeeklyHours>({});
  const [closedDates, setClosedDates] = useState<{ id: string; date: string; reason: string | null }[]>([]);
  const [overrides, setOverrides] = useState<{ id: string; date: string; open_time: string; close_time: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideOpen, setOverrideOpen] = useState("12:00");
  const [overrideClose, setOverrideClose] = useState("23:00");
  const [error, setError] = useState("");

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    getWeeklyHours().then(setWeeklyHoursState);
    getClosedDates().then(setClosedDates);
    getDateHourOverrides().then(setOverrides);
  }, []);

  async function handleSaveWeekly() {
    setSaving(true);
    setError("");
    const result = await setWeeklyHours(weeklyHours);
    setSaving(false);
    if (result?.error) setError(result.error);
  }

  function updateDay(dayIndex: number, value: DayHours) {
    setWeeklyHoursState((prev) => ({ ...prev, [String(dayIndex)]: value }));
  }

  async function handleAddClosed(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newClosedDate) return;
    const result = await addClosedDate(newClosedDate, newClosedReason);
    if (result?.error) setError(result.error);
    else {
      setNewClosedDate("");
      setNewClosedReason("");
      getClosedDates().then(setClosedDates);
    }
  }

  async function handleAddOverride(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!overrideDate) return;
    const result = await addDateHourOverride(overrideDate, overrideOpen, overrideClose);
    if (result?.error) setError(result.error);
    else {
      setOverrideDate("");
      getDateHourOverrides().then(setOverrides);
    }
  }

  const closedSet = new Set(closedDates.map((d) => d.date));

  return (
    <div className="space-y-8">
      <div className="card-soft p-6">
        <h3 className="text-lg font-semibold text-white">Dias e horários de atendimento</h3>
        <p className="mt-1 text-sm text-slate-400">
          Defina os dias de abertura e o horário de cada dia. Use o calendário e as listas abaixo para exceções.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-sm font-medium text-slate-300">Calendário do mês</p>
            <DayPicker
              mode="single"
              selected={undefined}
              onSelect={() => {}}
              locale={ptBR}
              className="rdp-reservation"
              required={false}
              modifiers={{ closed: (d) => closedSet.has(format(d, "yyyy-MM-dd")) }}
              modifiersClassNames={{ closed: "opacity-50 bg-red-500/10" }}
            />
            <p className="mt-2 text-xs text-slate-500">Datas em verde = abertura normal; fechamentos listados abaixo.</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">Horário por dia da semana</p>
            <div className="space-y-3">
              {dayNames.map((name, i) => {
                const day = weeklyHours[String(i)] ?? null;
                const isOpen = day !== null;
                return (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
                    <span className="w-24 text-sm font-medium text-slate-200">{name}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => updateDay(i, e.target.checked ? { open: "12:00", close: "23:00" } : null)}
                        className="h-4 w-4 rounded border-slate-500 text-[#32C76A]"
                      />
                      <span className="text-sm text-slate-400">Aberto</span>
                    </label>
                    {isOpen && (
                      <>
                        <input
                          type="time"
                          value={day.open}
                          onChange={(e) => updateDay(i, { ...day, open: e.target.value })}
                          className="input-field w-28 py-1.5 text-sm"
                        />
                        <span className="text-slate-500">até</span>
                        <input
                          type="time"
                          value={day.close}
                          onChange={(e) => updateDay(i, { ...day, close: e.target.value })}
                          className="input-field w-28 py-1.5 text-sm"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleSaveWeekly}
              disabled={saving}
              className="btn-primary mt-4 rounded-xl"
            >
              {saving ? "Salvando…" : "Salvar horários"}
            </button>
          </div>
        </div>
      </div>

      <div className="card-soft p-6">
        <h3 className="text-lg font-semibold text-white">Datas de não abertura</h3>
        <p className="mt-1 text-sm text-slate-400">
          Adicione datas em que a casa não abre (feriados, folgas).
        </p>
        <form onSubmit={handleAddClosed} className="mt-4 flex flex-wrap gap-3">
          <input
            type="date"
            value={newClosedDate}
            onChange={(e) => setNewClosedDate(e.target.value)}
            className="input-field w-40"
          />
          <input
            type="text"
            value={newClosedReason}
            onChange={(e) => setNewClosedReason(e.target.value)}
            className="input-field min-w-[200px] flex-1"
            placeholder="Motivo (opcional)"
          />
          <button type="submit" className="btn-primary rounded-xl">Adicionar</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-2">
          {closedDates.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="font-medium text-slate-200">
                {format(new Date(d.date), "EEEE, d MMM yyyy", { locale: ptBR })}
              </span>
              {d.reason && <span className="text-slate-400">{d.reason}</span>}
              <button
                type="button"
                onClick={async () => {
                  const r = await removeClosedDate(d.id);
                  if (!r?.error) getClosedDates().then(setClosedDates);
                }}
                className="text-sm text-red-400 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        {closedDates.length === 0 && (
          <p className="mt-2 text-slate-400">Nenhuma data de fechamento cadastrada.</p>
        )}
      </div>

      <div className="card-soft p-6">
        <h3 className="text-lg font-semibold text-white">Horário específico em uma data</h3>
        <p className="mt-1 text-sm text-slate-400">
          Defina um horário diferente para um dia específico (ex.: evento noturno).
        </p>
        <form onSubmit={handleAddOverride} className="mt-4 flex flex-wrap gap-3">
          <input
            type="date"
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
            className="input-field w-40"
          />
          <input
            type="time"
            value={overrideOpen}
            onChange={(e) => setOverrideOpen(e.target.value)}
            className="input-field w-28"
          />
          <span className="text-slate-500">até</span>
          <input
            type="time"
            value={overrideClose}
            onChange={(e) => setOverrideClose(e.target.value)}
            className="input-field w-28"
          />
          <button type="submit" className="btn-primary rounded-xl">Adicionar</button>
        </form>
        <ul className="mt-4 space-y-2">
          {overrides.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="font-medium text-slate-200">
                {format(new Date(o.date), "dd/MM/yyyy", { locale: ptBR })} — {o.open_time} às {o.close_time}
              </span>
              <button
                type="button"
                onClick={async () => {
                  const r = await removeDateHourOverride(o.id);
                  if (!r?.error) getDateHourOverrides().then(setOverrides);
                }}
                className="text-sm text-red-400 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        {overrides.length === 0 && (
          <p className="mt-2 text-slate-400">Nenhum horário específico cadastrado.</p>
        )}
      </div>
    </div>
  );
}
