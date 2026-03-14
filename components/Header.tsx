import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

interface HeaderProps {
  userEmail?: string | null;
  isMaster?: boolean;
  companyName?: string | null;
}

export function Header({ userEmail, isMaster, companyName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[var(--bg-nav)] shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
          <span className="text-xs text-[var(--text-muted)]">{APP_TAGLINE}</span>
        </Link>
        <nav className="flex flex-shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
          <Link href="/reservar" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
            Reservar
          </Link>
          {userEmail ? (
            <>
              <Link href="/reservas" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
                Calendário
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
                Dashboard
              </Link>
              <Link href="/configuracoes" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
                Configurações
              </Link>
              <Link href="/exportar" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
                Exportar
              </Link>
              {isMaster && (
                <Link href="/admin" className="text-sm font-medium text-[#32C76A] hover:text-[#28a745] transition-colors">
                  Painel master
                </Link>
              )}
              {companyName && (
                <span className="text-sm font-medium text-slate-200" title={companyName}>
                  {companyName.length > 20 ? `${companyName.slice(0, 18)}…` : companyName}
                </span>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-[#32C76A] transition-colors">
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
