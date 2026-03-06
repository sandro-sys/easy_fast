import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="card space-y-6">
        <h1 className="text-xl font-bold text-[#32C76A]">
          Configurar Supabase
        </h1>
        <p className="text-slate-300">
          Para usar o sistema de reservas (calendário, login e dados), é
          preciso configurar o Supabase. Crie um projeto em{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#32C76A] underline hover:text-[#2ab55d]"
          >
            supabase.com
          </a>{" "}
          e preencha as variáveis abaixo.
        </p>
        <div className="rounded-xl bg-black/30 p-4 font-mono text-sm text-slate-200">
          <p className="mb-2 font-semibold text-slate-300">Arquivo: .env.local (na raiz do projeto)</p>
          <pre className="whitespace-pre-wrap break-all">
{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima`}
          </pre>
        </div>
        <p className="text-sm text-slate-400">
          Os valores estão em: Supabase Dashboard → seu projeto → Settings →
          API (Project URL e anon public key).
        </p>
        <p className="text-sm text-slate-400">
          Depois de salvar o arquivo, reinicie o servidor (pare e suba de novo
          com <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-300">npm run dev</code> ou
          o comando que você usa).
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary rounded-xl px-4 py-2 text-sm"
          >
            Abrir configurações do Supabase
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-500 bg-[#22252a] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-[#2a2e34]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
