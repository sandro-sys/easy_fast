"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClosedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface ClosedDatesListProps {
  closedDates: ClosedDate[];
  addClosedDate: (date: string, reason: string) => Promise<{ error: string | null }>;
  removeClosedDate: (id: string) => Promise<{ error: string | null }>;
}

export function ClosedDatesList({
  closedDates,
  addClosedDate,
  removeClosedDate,
}: ClosedDatesListProps) {
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newDate) {
      setError("Informe a data.");
      return;
    }
    const result = await addClosedDate(newDate, newReason);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNewDate("");
    setNewReason("");
  }

  return (
    <div className="card mt-6">
      <h3 className="font-semibold text-[#32C76A]">Datas de fechamento ou restrição</h3>
      <p className="mt-1 text-sm text-slate-400">
        Essas datas não aparecerão no calendário para reservas.
      </p>
      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-3">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="input-field w-40"
        />
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="input-field flex-1 min-w-[200px]"
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
            {d.reason && (
              <span className="text-slate-400">{d.reason}</span>
            )}
            <button
              type="button"
              onClick={async () => {
                setError("");
                const result = await removeClosedDate(d.id);
                if (result?.error) setError(result.error);
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
  );
}
