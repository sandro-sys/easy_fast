import Link from "next/link";

export default function PlanosSucessoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white">Pagamento aprovado</h1>
      <p className="mt-2 text-slate-400">
        Seu plano foi ativado. Em instantes as alterações estarão disponíveis.
      </p>
      <Link
        href="/reservas"
        className="mt-8 inline-block rounded-xl bg-[#32C76A] px-6 py-3 font-semibold text-white hover:bg-[#2ab55d]"
      >
        Ir ao Calendário
      </Link>
    </div>
  );
}
