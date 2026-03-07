"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, subMonths } from "date-fns";
import { exportReservationsAsCsv } from "@/app/actions/exports";
import type { ExportHistoryItem } from "@/app/actions/exports";

const today = format(new Date(), "yyyy-MM-dd");
const defaultFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd");

interface ExportLeadsFormProps {
  history: ExportHistoryItem[];
}

export function ExportLeadsForm({ history }: ExportLeadsFormProps) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (dateFrom > dateTo) {
      setError("Data inicial não pode ser maior que a data final.");
      return;
    }
    setLoading(true);
    const result = await exportReservationsAsCsv(dateFrom, dateTo);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.csv != null && result.filename) {
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="card-soft p-6">
        <h2 className="text-lg font-semibold text-white">Exportar reservas por data</h2>
        <p className="mt-1 text-sm text-slate-400">
          Escolha o período e baixe um arquivo CSV com todas as reservas (leads). O download abre automaticamente e a exportação é registrada no histórico abaixo.
        </p>
        <form onSubmit={handleExport} className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Data inicial</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo}
              className="input-field-modern"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Data final</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              max={today}
              className="input-field-modern"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#32C76A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ab55d] disabled:opacity-50"
          >
            {loading ? "Exportando…" : "Exportar CSV"}
          </button>
        </form>
        {error && (
          <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="card-soft p-6">
        <h2 className="text-lg font-semibold text-white">Histórico de exportações</h2>
        <p className="mt-1 text-sm text-slate-400">
          Últimas exportações de leads realizadas.
        </p>
        {history.length === 0 ? (
          <p className="mt-4 text-slate-400">Nenhuma exportação registrada ainda.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Período</th>
                  <th className="pb-2 pr-4 font-medium">Registros</th>
                  <th className="pb-2 font-medium">Exportado em</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      {h.date_from} a {h.date_to}
                    </td>
                    <td className="py-3 pr-4">{h.total_rows}</td>
                    <td className="py-3">
                      {new Date(h.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
