import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="border-b border-slate-500/30 bg-slate-500/10 px-4 py-2.5 text-center text-sm text-slate-200">
      <span className="font-medium">Modo demonstração.</span>{" "}
      Você pode navegar e testar o app. Para usar com dados reais e login,{" "}
      <Link href="/setup" className="font-medium text-[#32C76A] underline hover:text-[#28a745]">
        configure o Supabase
      </Link>
      .
    </div>
  );
}
