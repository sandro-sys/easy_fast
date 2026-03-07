import { getSettings, getClosedDates, getWeeklyHours, getDateHourOverrides } from "@/app/actions/settings";
import { getMyCompany } from "@/app/actions/companies";
import { ReservationCalendar } from "@/components/ReservationCalendar";

export default async function ReservasPage() {
  const settings = await getSettings();
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);
  const closedDatesList = await getClosedDates();
  const closedDates = closedDatesList.map((d) => d.date);
  const company = await getMyCompany();
  const companyWhatsapp = company?.whatsapp_number ?? null;
  const weeklyHours = await getWeeklyHours();
  const dateHourOverrides = await getDateHourOverrides();

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8">
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
        companyWhatsapp={companyWhatsapp}
        weeklyHours={weeklyHours}
        dateHourOverrides={dateHourOverrides}
      />
    </div>
  );
}
