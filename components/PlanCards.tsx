"use client";

import { Clock, Zap, Crown, Check, X, Shield, Headphones, XCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  features: string[];
  featuresExcluded?: string[];
  active: boolean;
  sort_order: number;
}

interface PlanCardsProps {
  plans: Plan[];
}

const PLAN_ACCENT = {
  trial: { icon: Clock, border: "border-slate-500/40", iconBg: "bg-slate-500/20", iconColor: "text-slate-400", button: "bg-[#404554] hover:bg-[#4d5564] text-white" },
  starter: { icon: Zap, border: "border-[#32C76A]/60", iconBg: "bg-[#32C76A]/20", iconColor: "text-[#32C76A]", button: "bg-[#32C76A] hover:bg-[#2ab55d] text-white" },
  pro: { icon: Crown, border: "border-[#F98F29]/60", iconBg: "bg-[#F98F29]/20", iconColor: "text-[#F98F29]", button: "bg-[#F98F29] hover:bg-[#e88220] text-white" },
} as const;

function getAccent(planId: string) {
  if (planId === "starter") return PLAN_ACCENT.starter;
  if (planId === "pro") return PLAN_ACCENT.pro;
  return PLAN_ACCENT.trial;
}

export function PlanCards({ plans }: PlanCardsProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-xl border border-slate-600/40 bg-[#22252a] p-8 text-center">
        <p className="text-slate-400">
          Nenhum plano cadastrado. Use o usuário master no Supabase para inserir planos na tabela{" "}
          <code className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-300">plans</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const accent = getAccent(plan.id);
          const Icon = accent.icon;
          const isPro = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-[#22252a] p-6 ${accent.border}`}
            >
              {isPro && (
                <div className="absolute -top-3 right-4 rounded-full bg-[#F98F29] px-3 py-1 text-xs font-semibold text-white">
                  Mais Popular
                </div>
              )}

              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${accent.iconBg} ${accent.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              {plan.description && (
                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
              )}

              <div className="mt-5">
                {plan.price_cents === 0 ? (
                  <>
                    <p className="text-2xl font-bold text-white">Grátis</p>
                    <p className="text-sm text-slate-400">14 dias grátis</p>
                  </>
                ) : plan.price_cents != null ? (
                  <p className="text-2xl font-bold text-white">
                    R$ {(plan.price_cents / 100).toFixed(2).replace(".", ",")}
                    <span className="text-sm font-normal text-slate-400">/mês</span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-slate-300">Sob consulta</p>
                )}
              </div>

              <button
                type="button"
                className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${accent.button}`}
              >
                {plan.price_cents === 0 ? "Começar Trial Grátis" : "Assinar Agora"}
              </button>

              <div className="mt-6 border-t border-slate-600/50 pt-5">
                <p className="mb-3 text-sm font-medium text-slate-400">O que está incluído:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 shrink-0 text-[#32C76A]" />
                      {f}
                    </li>
                  ))}
                  {plan.featuresExcluded?.map((f, i) => (
                    <li key={`ex-${i}`} className="flex items-center gap-2 text-sm text-slate-500">
                      <X className="h-4 w-4 shrink-0 text-slate-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-12 grid gap-6 border-t border-slate-600/50 pt-10 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-600/30">
            <Shield className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-white">Pagamento Seguro</p>
            <p className="text-sm text-slate-400">Seus dados protegidos com criptografia de ponta</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-600/30">
            <Headphones className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-white">Suporte Dedicado</p>
            <p className="text-sm text-slate-400">Equipe pronta para ajudar quando precisar</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-600/30">
            <XCircle className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-white">Cancele Quando Quiser</p>
            <p className="text-sm text-slate-400">Sem multas ou taxas de cancelamento</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
