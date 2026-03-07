import Link from "next/link";

export default function PlanosErroPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white">Pagamento não concluído</h1>
      <p className="mt-2 text-slate-400">
        O pagamento foi recusado ou cancelado. Você pode tentar novamente quando quiser.
      </p>
      <Link
        href="/planos"
        className="mt-8 inline-block rounded-xl bg-[#32C76A] px-6 py-3 font-semibold text-white hover:bg-[#2ab55d]"
      >
        Voltar aos planos
      </Link>
    </div>
  );
}
