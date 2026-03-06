import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WeeklyMetrics } from "@/components/WeeklyMetrics";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const reservations = supabase
    ? (
        await supabase
          .from("reservations")
          .select("*")
          .gte("reservation_date", format(weekStart, "yyyy-MM-dd"))
          .lte("reservation_date", format(weekEnd, "yyyy-MM-dd"))
          .neq("status", "cancelled")
          .order("reservation_date", { ascending: true })
          .order("reservation_time", { ascending: true })
      ).data ?? []
    : [];

  const total = reservations.length;
  const confirmed = reservations.filter((r) => r.status === "confirmed" || r.status === "completed").length;
  const pre = reservations.filter((r) => r.status === "pre").length;
  const attended = reservations.filter((r) => r.attended === true).length;
  const noShow = reservations.filter((r) => r.attended === false || r.status === "no_show").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-slate-400">
        Semana de {format(weekStart, "d MMM", { locale: ptBR })} a{" "}
        {format(weekEnd, "d MMM yyyy", { locale: ptBR })}
      </p>
      <WeeklyMetrics
        total={total}
        confirmed={confirmed}
        pre={pre}
        attended={attended}
        noShow={noShow}
      />
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Reservas da semana</h2>
        {reservations.length === 0 ? (
          <p className="mt-2 text-slate-400">Nenhuma reserva nesta semana.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="card flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <span className="font-medium text-slate-100">{r.guest_name}</span>
                  <span className="mx-2 text-slate-500">•</span>
                  <span className="text-slate-400">{r.reservation_date}</span>
                  <span className="text-slate-500">{r.reservation_time}</span>
                  {r.status === "pre" && (
                    <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                      Pré-reserva
                    </span>
                  )}
                  {r.attended === true && (
                    <span className="ml-2 rounded bg-[#32C76A]/20 px-1.5 py-0.5 text-xs text-[#32C76A]">
                      Compareceu
                    </span>
                  )}
                  {r.attended === false && (
                    <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                      Não compareceu
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
