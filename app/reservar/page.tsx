import { PublicBookingFlow } from "@/components/PublicBookingFlow";

export const metadata = {
  title: "Fazer reserva | Easy & Fast",
  description: "Escolha o restaurante e faça sua reserva. Fácil e rápido.",
};

export default function ReservarPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Fazer reserva
        </h1>
        <p className="mt-2 text-slate-400">
          Escolha o restaurante e selecione data e horário para sua reserva.
        </p>
      </header>
      <PublicBookingFlow />
    </div>
  );
}
