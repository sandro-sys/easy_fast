import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getPublicCompanyForBooking } from "@/app/actions/public-booking";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const company = await getPublicCompanyForBooking(params.slug);
  if (!company) return { title: "Reserva | Easy & Fast" };
  return {
    title: `Reservar em ${company.name} | Easy & Fast`,
    description: `Faça sua reserva no ${company.name}. Escolha data, horário e número de pessoas.`,
  };
}

export default async function ReservarRestaurantePage({ params }: Props) {
  const company = await getPublicCompanyForBooking(params.slug);
  if (!company) notFound();

  // Se acessou com link antigo (UUID) e a empresa tem slug, redireciona para a URL com o nome
  if (UUID_REGEX.test(params.slug) && company.slug) {
    redirect(`/reservar/${company.slug}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner com foto do restaurante */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-200 md:h-64">
        {company.cover_image_url ? (
          <img
            src={company.cover_image_url}
            alt={company.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-500">
            <span className="text-sm">{company.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{company.name}</h1>
          <p className="mt-1 text-sm text-white/90">Reserve sua mesa</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/reservar" className="hover:text-slate-700">Restaurantes</Link>
          <span>/</span>
          <span className="text-slate-700">{company.name}</span>
        </div>
        <PublicBookingFlow initialCompany={company} />
      </div>
    </div>
  );
}
