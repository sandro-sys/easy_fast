-- ============================================================
-- Schema do app Reservas (Supabase)
-- Execute no SQL Editor do seu projeto Supabase (New query → Run)
-- ============================================================

-- Tabela: reservas
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  observation text,
  reservation_date date NOT NULL,
  reservation_time text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  attended boolean,
  reminder_sent_at timestamptz
);

-- Tabela: configurações (chave-valor)
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- Tabela: datas de fechamento (feriados, folgas)
CREATE TABLE IF NOT EXISTS public.closed_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text
);

-- Tabela: planos (opcional; se vazia, o app usa os planos do código)
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer,
  features jsonb DEFAULT '[]',
  features_excluded jsonb DEFAULT '[]',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0
);

-- Índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_created_by ON public.reservations(created_by);
CREATE INDEX IF NOT EXISTS idx_closed_dates_date ON public.closed_dates(date);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closed_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Reservations: usuário autenticado pode fazer tudo (leitura/inserção/atualização)
CREATE POLICY "reservations_select" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "reservations_insert" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reservations_update" ON public.reservations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "reservations_delete" ON public.reservations FOR DELETE TO authenticated USING (true);

-- Settings: usuário autenticado pode ler e alterar
CREATE POLICY "settings_select" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_insert" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "settings_update" ON public.settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "settings_delete" ON public.settings FOR DELETE TO authenticated USING (true);

-- Closed dates: usuário autenticado pode fazer tudo
CREATE POLICY "closed_dates_select" ON public.closed_dates FOR SELECT TO authenticated USING (true);
CREATE POLICY "closed_dates_insert" ON public.closed_dates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "closed_dates_update" ON public.closed_dates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "closed_dates_delete" ON public.closed_dates FOR DELETE TO authenticated USING (true);

-- Plans: qualquer um pode ler (para página de planos); só autenticado altera (se quiser gerenciar pelo app)
CREATE POLICY "plans_select" ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_select_anon" ON public.plans FOR SELECT TO anon USING (true);
CREATE POLICY "plans_insert" ON public.plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plans_update" ON public.plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "plans_delete" ON public.plans FOR DELETE TO authenticated USING (true);

-- ============================================================
-- (Opcional) Valor padrão do limite de reservas por horário
-- ============================================================

INSERT INTO public.settings (key, value, updated_at)
VALUES ('reservation_limit_per_slot', '10', now())
ON CONFLICT (key) DO NOTHING;
