"use client";

import { useState } from "react";

interface SettingsFormProps {
  initialLimit: number;
  setReservationLimit: (limit: number) => Promise<{ error: string | null }>;
}

export function SettingsForm({ initialLimit, setReservationLimit }: SettingsFormProps) {
  const [limit, setLimit] = useState(initialLimit);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await setReservationLimit(limit);
    if (!result.error) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="card-soft">
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
        <button type="submit" className="btn-primary rounded-xl">
          Salvar
        </button>
        {saved && <span className="text-sm text-[#32C76A]">Salvo!</span>}
      </div>
    </form>
  );
}
