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
      "14 dias de teste",
      "3 reservas por dia",
      "Calendário de reservas",
      "Limite por horário configurável",
    ],
    featuresExcluded: [
      "Mensagem para o cliente",
      "Métricas de agendamento",
      "Lista de clientes para pós-venda",
      "Dashboard e relatórios",
    ],
    active: true,
    sort_order: 1,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Para pequenos negócios",
    price_cents: 4900,
    features: [
      "5 reservas por dia",
      "Mensagem para o cliente (confirmação)",
      "Calendário de reservas",
      "Limite por horário configurável",
    ],
    featuresExcluded: [
      "Métricas de agendamento",
      "Lista de clientes para pós-venda",
      "Dashboard e relatórios",
    ],
    active: true,
    sort_order: 2,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para empresas em crescimento",
    price_cents: 9900,
    features: [
      "Reservas ilimitadas",
      "Mensagem para o cliente",
      "Métricas de agendamento",
      "Lista de clientes para pós-venda",
      "Dashboard e relatórios",
    ],
    active: true,
    sort_order: 3,
  },
];
