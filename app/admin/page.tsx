import { getAdminMetrics } from "@/app/actions/companies";
import { Building2, Calendar, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminApproveButton } from "@/components/AdminApproveButton";

export default async function AdminPage() {
  const metrics = await getAdminMetrics();
  if (!metrics) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-slate-400">Acesso negado ou métricas indisponíveis.</p>
      </div>
    );
  }

  const { companies, totalReservations } = metrics;
  const totalUsers = new Set(companies.map((c) => c.owner_id)).size;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Painel gerencial</h1>
      <p className="mt-1 text-slate-400">
        Empresas e usuários cadastrados. Aprove acesso para liberar funcionalidades.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[var(--bg-elevated)] p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32C76A]/20">
              <Building2 className="h-6 w-6 text-[#32C76A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{companies.length}</p>
              <p className="text-sm text-slate-400">Empresas cadastradas</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[var(--bg-elevated)] p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32C76A]/20">
              <Users className="h-6 w-6 text-[#32C76A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
              <p className="text-sm text-slate-400">Usuários (responsáveis)</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[var(--bg-elevated)] p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/20">
              <Calendar className="h-6 w-6 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalReservations}</p>
              <p className="text-sm text-slate-400">Total de reservas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Empresas e responsáveis</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--bg-elevated)] shadow-lg">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="p-4 font-medium">Empresa</th>
                <th className="p-4 font-medium">Responsável</th>
                <th className="p-4 font-medium">CNPJ</th>
                <th className="p-4 font-medium">WhatsApp</th>
                <th className="p-4 font-medium">Reservas</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-slate-400">
                    Nenhuma empresa cadastrada ainda.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-medium text-slate-200">{c.name}</td>
                    <td className="p-4 text-slate-300">{c.owner_email ?? "—"}</td>
                    <td className="p-4 text-slate-400">
                      {c.cnpj
                        ? c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
                        : "—"}
                    </td>
                    <td className="p-4 text-slate-400">
                      {c.whatsapp_number ? (
                        <a
                          href={`https://wa.me/55${c.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#32C76A] hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {c.whatsapp_number}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-white">{c.reservation_count}</td>
                    <td className="p-4">
                      <AdminApproveButton companyId={c.id} approved={c.approved} />
                    </td>
                    <td className="p-4 text-slate-400">
                      {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
