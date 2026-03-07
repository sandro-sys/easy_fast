"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyPlan } from "@/app/actions/companies";

interface AdminPlanSelectProps {
  companyId: string;
  currentPlan: string;
}

const PLANS = [
  { value: "trial", label: "Trial" },
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
] as const;

export function AdminPlanSelect({ companyId, currentPlan }: AdminPlanSelectProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(currentPlan);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (plan === currentPlan) return;
    setSaving(true);
    await updateCompanyPlan(companyId, plan);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-200 focus:border-[#32C76A]/50 focus:outline-none"
      >
        {PLANS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {plan !== currentPlan && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#32C76A] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#2ab55d] disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      )}
    </div>
  );
}
