import Link from "next/link";
import { getMyCompany } from "@/app/actions/companies";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isMasterUser } from "@/lib/auth-utils";
import { Clock } from "lucide-react";

export const metadata = {
  title: "Aguardando aprovação | Easy & Fast",
  description: "Sua empresa está aguardando liberação do administrador.",
};

export default async function AguardandoAprovacaoPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-slate-400">Configuração indisponível.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = await getMyCompany();
  const isMaster = isMasterUser(user.email);

  if (isMaster || !company) redirect("/dashboard");
  if (company.approved) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
          <Clock className="h-7 w-7 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Aguardando aprovação</h1>
        <p className="mt-3 text-slate-300">
          Sua empresa <strong>{company.name}</strong> foi cadastrada e está aguardando liberação do administrador.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Enquanto isso, você pode apenas visualizar. Assim que o acesso for aprovado, todas as funcionalidades serão liberadas.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
