import { getSettings, setReservationLimit } from "@/app/actions/settings";
import { SettingsForm } from "@/components/SettingsForm";
import { OpeningHoursConfig } from "@/components/OpeningHoursConfig";

export default async function ConfiguracoesPage() {
  const settings = await getSettings();
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <p className="mt-1 text-slate-400">
        Limite de reservas, dias de abertura e horários de atendimento.
      </p>
      <div className="mt-6">
        <SettingsForm initialLimit={limit} setReservationLimit={setReservationLimit} />
      </div>
      <div className="mt-8">
        <OpeningHoursConfig />
      </div>
    </div>
  );
}
