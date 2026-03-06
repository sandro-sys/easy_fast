import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-200">
      <span className="font-medium">Modo demonstração.</span>{" "}
      Você pode navegar e testar o app. Para usar com dados reais e login,{" "}
      <Link href="/setup" className="font-medium text-amber-300 underline hover:text-amber-200">
        configure o Supabase
      </Link>
      .
    </div>
  );
}
