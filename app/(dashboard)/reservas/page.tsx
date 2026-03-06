import { getSettings, getClosedDates } from "@/app/actions/settings";
import { ReservationCalendar } from "@/components/ReservationCalendar";

export default async function ReservasPage() {
  const settings = await getSettings();
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);
  const closedDatesList = await getClosedDates();
  const closedDates = closedDatesList.map((d) => d.date);

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
        closedDates={closedDates}
      />
    </div>
  );
}
