import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WeeklyMetrics } from "@/components/WeeklyMetrics";
import { WeekCalendarReservations } from "@/components/WeekCalendarReservations";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const allReservations = supabase
    ? (
        await supabase
          .from("reservations")
          .select("*")
          .gte("reservation_date", format(weekStart, "yyyy-MM-dd"))
          .lte("reservation_date", format(weekEnd, "yyyy-MM-dd"))
          .order("reservation_date", { ascending: true })
          .order("reservation_time", { ascending: true })
      ).data ?? []
    : [];

  const reservations = allReservations.filter((r) => r.status !== "cancelled");
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
      <WeekCalendarReservations
        weekStart={weekStart}
        weekEnd={weekEnd}
        reservations={allReservations}
      />
    </div>
  );
}
