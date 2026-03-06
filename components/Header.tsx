import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#171A1E]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
          <span className="text-xs text-slate-400">{APP_TAGLINE}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/reservas"
            className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
          >
            Calendário
          </Link>
          <Link
            href="/planos"
            className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
          >
            Planos
          </Link>
          {userEmail ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/configuracoes"
                className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
              >
                Configurações
              </Link>
              <span className="text-sm text-slate-400" title={userEmail}>
                {userEmail}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#32C76A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2ab55d]"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
