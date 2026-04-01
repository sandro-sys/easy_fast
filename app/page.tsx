import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const isLoggedIn = !!user;

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{APP_TAGLINE}</p>
        <p className="mt-6 text-lg text-[var(--text)]">
          Gestão de reservas para seu restaurante. Calendário, limites e
          lembretes em um só lugar.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {isLoggedIn ? (
          <>
            <Link
              href="/reservas"
              className="rounded-xl bg-[#32C76A] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              Ir ao Calendário
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-xl bg-[#32C76A] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 border-[#32C76A] bg-transparent px-6 py-3 text-base font-medium text-[#32C76A] transition-colors hover:bg-[#32C76A]/10"
            >
              Criar conta
            </Link>
          </>
        )}
      </div>
      <div className="mt-16 grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
        <div className="card max-w-[280px]">
          <h3 className="font-semibold text-[#32C76A]">Calendário</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Visualize e gerencie todas as reservas em um único lugar. Escolha data e horário de forma intuitiva, reduza falhas de agendamento e deixe sua equipe e clientes sempre alinhados.
          </p>
        </div>
        <div className="card max-w-[280px]">
          <h3 className="font-semibold text-[#32C76A]">Limites</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Defina quantas reservas aceitar por horário e evite superlotação. Garante qualidade no atendimento, previsibilidade na cozinha e melhor experiência para quem visita seu estabelecimento.
          </p>
        </div>
        <div className="card max-w-[280px]">
          <h3 className="font-semibold text-[#32C76A]">WhatsApp</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Envie confirmação e lembretes direto pelo WhatsApp. Aumenta o comparecimento, reduz no-show e fortalece o vínculo com o cliente no canal que ele já usa no dia a dia.
          </p>
        </div>
        <div className="card max-w-[280px]">
          <h3 className="font-semibold text-[#32C76A]">Métricas</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Acompanhe reservas da semana, taxa de comparecimento e desempenho. Tome decisões com base em dados e identifique tendências para otimizar sua operação e seu faturamento.
          </p>
        </div>
      </div>
    </div>
  );
}
