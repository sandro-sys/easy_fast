-- ============================================================
-- Número de pessoas por reserva e limite de pessoas por dia
-- Execute no SQL Editor do Supabase após schema.sql e schema-companies (se usar).
-- ============================================================

-- Coluna: número de pessoas na reserva (padrão 1)
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS guest_count integer NOT NULL DEFAULT 1;

-- Configuração: número máximo de pessoas aceitas por dia (total das reservas).
-- 0 ou vazio = sem limite.
INSERT INTO public.settings (key, value, updated_at)
VALUES ('max_people_per_day', '0', now())
ON CONFLICT (key) DO NOTHING;
