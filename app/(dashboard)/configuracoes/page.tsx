import { getSettings, setReservationLimit, addClosedDate, removeClosedDate, getClosedDates } from "@/app/actions/settings";
import { SettingsForm } from "@/components/SettingsForm";
import { ClosedDatesList } from "@/components/ClosedDatesList";

export default async function ConfiguracoesPage() {
  const settings = await getSettings();
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);
  const closedDates = await getClosedDates();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <p className="mt-1 text-slate-400">
        Limite de reservas por horário e datas de fechamento.
      </p>
      <SettingsForm initialLimit={limit} setReservationLimit={setReservationLimit} />
      <ClosedDatesList
        closedDates={closedDates}
        addClosedDate={addClosedDate}
        removeClosedDate={removeClosedDate}
      />
    </div>
  );
}
