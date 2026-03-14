"use client";

import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="flex-shrink-0 whitespace-nowrap text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
    >
      Sair
    </button>
  );
}
