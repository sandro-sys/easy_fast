interface WeeklyMetricsProps {
  total: number;
  confirmed: number;
  pre: number;
  attended: number;
  noShow: number;
}

export function WeeklyMetrics({ total, confirmed, pre, attended, noShow }: WeeklyMetricsProps) {
  const cards = [
    { label: "Total reservas", value: total, color: "bg-[#32C76A] text-white" },
    { label: "Confirmadas", value: confirmed, color: "bg-emerald-600 text-white" },
    { label: "Pré-reservas", value: pre, color: "bg-amber-500 text-white" },
    { label: "Comparecimento", value: attended, color: "bg-blue-600 text-white" },
    { label: "Não compareceram", value: noShow, color: "bg-slate-600 text-white" },
  ];

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className={`card rounded-xl ${card.color} border-0 p-4`}>
          <p className="text-sm opacity-90">{card.label}</p>
          <p className="mt-1 text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
