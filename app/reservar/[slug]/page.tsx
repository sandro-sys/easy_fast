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
    <div className="min-h-screen bg-white">
      {/* Banner preto/cinza com nome do restaurante */}
      <div className="relative h-44 w-full overflow-hidden bg-[#1a1d21] md:h-52">
        {company.cover_image_url ? (
          <>
            <img
              src={company.cover_image_url}
              alt={company.name}
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-[#1a1d21]/80" />
          </>
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{company.name}</h1>
          <p className="mt-1 text-sm text-gray-300">Reserve sua mesa</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/reservar" className="hover:text-gray-800">Restaurantes</Link>
          <span>/</span>
          <span className="text-gray-800">{company.name}</span>
        </div>
        <PublicBookingFlow initialCompany={company} />
      </div>
    </div>
  );
}
