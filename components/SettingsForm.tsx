"use client";

import { useState } from "react";

interface SettingsFormProps {
  initialLimit: number;
  setReservationLimit: (limit: number) => Promise<{ error: string | null }>;
  initialMaxPeoplePerDay: number;
  setMaxPeoplePerDay: (max: number) => Promise<{ error: string | null }>;
}

export function SettingsForm({
  initialLimit,
  setReservationLimit,
  initialMaxPeoplePerDay,
  setMaxPeoplePerDay,
}: SettingsFormProps) {
  const [limit, setLimit] = useState(initialLimit);
  const [maxPeople, setMaxPeople] = useState(initialMaxPeoplePerDay);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [r1, r2] = await Promise.all([
      setReservationLimit(limit),
      setMaxPeoplePerDay(maxPeople),
    ]);
    if (!r1.error && !r2.error) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="card-soft space-y-6">
      <div>
        <h3 className="font-semibold text-[#32C76A]">Limite de reservas por horário</h3>
        <p className="mt-1 text-sm text-slate-400">
          Número máximo de reservas permitidas em um mesmo horário.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={99}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="input-field w-24"
          />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-[#32C76A]">Máximo de pessoas por dia</h3>
        <p className="mt-1 text-sm text-slate-400">
          Soma total de pessoas de todas as reservas do dia. Use 0 para sem limite.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={9999}
            value={maxPeople}
            onChange={(e) => setMaxPeople(Number(e.target.value))}
            className="input-field w-24"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary rounded-xl">
          Salvar
        </button>
        {saved && <span className="text-sm text-[#32C76A]">Salvo!</span>}
      </div>
    </form>
  );
}
