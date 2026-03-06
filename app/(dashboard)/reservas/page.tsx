import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/app/actions/settings";
import { ReservationCalendar } from "@/components/ReservationCalendar";

export default async function ReservasPage() {
  const supabase = await createClient();
  const settings = await getSettings();
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);

  const closedSet = new Set<string>();
  if (supabase) {
    const { data: closedDates } = await supabase
      .from("closed_dates")
      .select("date");
    (closedDates ?? []).forEach((d) => closedSet.add(d.date));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Calendário de reservas
        </h1>
        <p className="mt-1.5 text-slate-400">
          Selecione a data, o horário e preencha os dados para concluir a reserva.
        </p>
      </header>
      <ReservationCalendar
        limitPerSlot={limit}
        closedDates={Array.from(closedSet)}
      />
    </div>
  );
}
