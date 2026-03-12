"use client";

import { useRouter } from "next/navigation";
import { approveCompany } from "@/app/actions/companies";

interface AdminApproveButtonProps {
  companyId: string;
  approved: boolean;
}

export function AdminApproveButton({ companyId, approved }: AdminApproveButtonProps) {
  const router = useRouter();

  async function handleApprove() {
    await approveCompany(companyId);
    router.refresh();
  }

  if (approved) {
    return (
      <span className="rounded-full bg-[#32C76A]/20 px-2.5 py-1 text-xs font-medium text-[#32C76A]">
        Aprovada
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleApprove}
      className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30"
    >
      Aprovar acesso
    </button>
  );
}
