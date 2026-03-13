import { getSettings, setReservationLimit, setMaxPeoplePerDay } from "@/app/actions/settings";
import { getMyCompany, type GetMyCompanyResult } from "@/app/actions/companies";
import { SettingsForm } from "@/components/SettingsForm";
import { OpeningHoursConfig } from "@/components/OpeningHoursConfig";
import { CompanyProfileCard } from "@/components/CompanyProfileCard";

export default async function ConfiguracoesPage() {
  const [settings, company] = await Promise.all([getSettings(), getMyCompany()]);
  const limit = Number(settings?.reservation_limit_per_slot ?? 10);
  const maxPeoplePerDay = Number(settings?.max_people_per_day ?? 0);
  const c = company as GetMyCompanyResult | null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <p className="mt-1 text-slate-400">
        Limite de reservas, dias de abertura e horários de atendimento.
      </p>
      <div className="mt-6">
        <SettingsForm
          initialLimit={limit}
          setReservationLimit={setReservationLimit}
          initialMaxPeoplePerDay={maxPeoplePerDay}
          setMaxPeoplePerDay={setMaxPeoplePerDay}
        />
      </div>
      <div className="mt-8">
        <OpeningHoursConfig />
      </div>
      {c && (
        <CompanyProfileCard
          company={{
            id: c.id,
            name: c.name,
            slug: c.slug ?? null,
            cover_image_url: c.cover_image_url ?? null,
          }}
        />
      )}
    </div>
  );
}
