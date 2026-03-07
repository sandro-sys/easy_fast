/**
 * Planos exibidos na página /planos.
 * Usados quando não há planos no Supabase (modo demo ou tabela vazia).
 * Para usar apenas o banco, deixe o array vazio ou remova o fallback na página.
 */
export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  /** Preço original antes do desconto (exibido riscado). Opcional. */
  price_original_cents?: number | null;
  features: string[];
  /** Itens não incluídos (exibidos com ícone x no card). Opcional. */
  featuresExcluded?: string[];
  active: boolean;
  sort_order: number;
}

export const DEFAULT_PLANS: Plan[] = [
  {
    id: "trial",
    name: "Trial",
    description: "Experimente grátis por 14 dias",
    price_cents: 0,
    features: [
      "14 dias grátis",
      "3 reservas por dia",
      "Calendário de reservas",
      "Horários configuráveis",
    ],
    featuresExcluded: [
      "Métricas de agendamento",
      "Exportação de dados",
    ],
    active: true,
    sort_order: 1,
  },
  {
    id: "basic",
    name: "Basic",
    description: "Para pequenos negócios",
    price_cents: 4990,
    price_original_cents: 7990,
    features: [
      "Reservas ilimitadas",
      "Mensagem para o cliente",
      "Métricas de agendamento",
      "Calendário e horários configuráveis",
    ],
    featuresExcluded: [
      "Exportação de dados",
    ],
    active: true,
    sort_order: 2,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para empresas em crescimento",
    price_cents: 9990,
    price_original_cents: 14990,
    features: [
      "Reservas ilimitadas",
      "Mensagem para o cliente",
      "Métricas de agendamento",
      "Lista de clientes para pós-venda",
      "Exportação de dados",
      "Dashboard e relatórios",
    ],
    featuresExcluded: [],
    active: true,
    sort_order: 3,
  },
];
