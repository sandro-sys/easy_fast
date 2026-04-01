import { notFound, redirect } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { getPublicCompanyForBooking } from "@/app/actions/public-booking";
import { PublicBookingFlow } from "@/components/PublicBookingFlow";
import { APP_NAME } from "@/lib/app-config";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const company = await getPublicCompanyForBooking(params.slug);
  if (!company) return { title: "Reserva | Easy & Fast" };
  return {
    title: `Reservar em ${company.name}`,
    description: `Faça sua reserva no ${company.name}. Escolha data, horário e número de pessoas.`,
  };
}

export default async function ReservarRestaurantePage({ params }: Props) {
  const company = await getPublicCompanyForBooking(params.slug);
  if (!company) notFound();

  if (UUID_REGEX.test(params.slug) && company.slug) {
    redirect(`/reservar/${company.slug}`);
  }

  const whatsappUrl = company.whatsapp_number
    ? `https://wa.me/55${company.whatsapp_number.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5" }}>
      {/* Banner do restaurante */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 220, background: "#1a1d21" }}>
        {company.cover_image_url && (
          <>
            <img
              src={company.cover_image_url}
              alt={company.name}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: 0.35 }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,29,33,0.4) 0%, rgba(26,29,33,0.92) 100%)" }} />
          </>
        )}
        <div className="relative mx-auto flex max-w-3xl flex-col justify-end px-6 py-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: "#32C76A" }}>
            Reserve sua mesa
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{company.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {company.address && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "#cbd5e1" }}>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "#32C76A" }} />
                {company.address}
              </span>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                style={{ color: "#cbd5e1" }}
              >
                <Phone className="h-4 w-4 shrink-0" style={{ color: "#32C76A" }} />
                {company.whatsapp_number}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de reserva */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PublicBookingFlow initialCompany={company} />
      </div>

      {/* Rodapé discreto */}
      <footer className="py-6 text-center text-xs" style={{ color: "#94a3b8" }}>
        Agendamento online por{" "}
        <span className="font-semibold" style={{ color: "#32C76A" }}>{APP_NAME}</span>
      </footer>
    </div>
  );
}
