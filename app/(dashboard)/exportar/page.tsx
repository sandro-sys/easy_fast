import { getExportHistory } from "@/app/actions/exports";
import { ExportLeadsForm } from "@/components/ExportLeadsForm";

export default async function ExportarPage() {
  const history = await getExportHistory();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Exportar leads</h1>
      <p className="mt-1 text-slate-400">
        Exporte as reservas por período em CSV e acompanhe o histórico de exportações.
      </p>
      <div className="mt-6">
        <ExportLeadsForm history={history} />
      </div>
    </div>
  );
}
