import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PLANS, type Plan } from "@/lib/plans";
import { PlanCards } from "@/components/PlanCards";

function normalizePlan(p: Record<string, unknown>): Plan {
  const features = p.features;
  const featuresArray = Array.isArray(features)
    ? (features as string[])
    : typeof features === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(features);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];
  const excluded = p.featuresExcluded ?? p.features_excluded;
  const excludedArray = Array.isArray(excluded)
    ? (excluded as string[])
    : typeof excluded === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(excluded);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : undefined;
  return {
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    description: p.description != null ? String(p.description) : null,
    price_cents: typeof p.price_cents === "number" ? p.price_cents : null,
    features: featuresArray,
    featuresExcluded: excludedArray?.length ? excludedArray : undefined,
    active: Boolean(p.active),
    sort_order: Number(p.sort_order) || 0,
  };
}

export default async function PlanosPage() {
  const supabase = await createClient();
  const dbPlans = supabase
    ? (await supabase.from("plans").select("*").eq("active", true).order("sort_order")).data ?? []
    : [];

  const plans =
    dbPlans.length > 0 ? dbPlans.map((p) => normalizePlan(p as Record<string, unknown>)) : DEFAULT_PLANS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
        Escolha o plano ideal para seu negócio
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
        Comece gratuitamente e escale conforme sua empresa cresce. Todos os planos incluem suporte e atualizações.
      </p>
      <PlanCards plans={plans} />
    </div>
  );
}
