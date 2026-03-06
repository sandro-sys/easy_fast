# Reservas — Sistema de reservas para restaurante

Sistema de gestão de reservas com calendário, limites por horário, datas de fechamento, confirmação por WhatsApp e métricas. Layout e cores alinhados ao CheckList App (SO.RH.IA).

## Pré-requisitos

- **Node.js** 18+ (não é necessário Python)
- Conta no [Supabase](https://supabase.com)

## Instalação

1. Clone ou copie o projeto e instale as dependências:

```bash
npm install
```

2. Crie um projeto no [Supabase](https://supabase.com/dashboard) e anote:
   - URL do projeto
   - Chave anônima (anon key)

3. Copie o arquivo de ambiente e preencha:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

4. No Supabase, abra **SQL Editor** e execute o conteúdo do arquivo `supabase/schema.sql`. Isso cria as tabelas, políticas RLS e o trigger de perfil.

5. Crie o primeiro usuário (e opcionalmente o master):
   - No Supabase: **Authentication** → **Users** → **Add user** (email + senha).
   - Para torná-lo **master**: no SQL Editor execute (troque `SEU-USER-UUID` pelo id do usuário):

```sql
UPDATE public.profiles SET role = 'master' WHERE id = 'SEU-USER-UUID';
```

6. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Funcionalidades

- **Calendário**: agendamento por data e horário.
- **Limite de reservas**: configurável em Configurações (por horário).
- **Datas de fechamento**: restrição de reservas em datas específicas.
- **Campos obrigatórios**: Nome, Telefone, Observação.
- **WhatsApp**: ao concluir a reserva, abre modal com dados e botão para abrir WhatsApp no navegador.
- **Pré-reserva**: opção ao criar a reserva.
- **Métricas da semana**: total, confirmadas, pré-reservas, comparecimento e não comparecimento no Dashboard.
- **Cancelamento**: na listagem de reservas do dia.
- **Comparecimento**: marcar “Compareceu” ou “Não compareceu” na listagem do dia.
- **Lembrete**: botão “Lembrete WhatsApp” que abre o WhatsApp com mensagem de lembrete e registra o envio.

## Estrutura Supabase

- **profiles**: usuários (role `master` ou `user`).
- **reservations**: reservas (status: pre, confirmed, cancelled, completed, no_show).
- **settings**: configurações (ex.: `reservation_limit_per_slot`).
- **closed_dates**: datas em que não há reservas.
- **plans**: planos (cards) — inserir via SQL ou futura área master.

## Inserir planos (cards)

Com um usuário **master** logado, você pode inserir planos diretamente no Supabase, ou executar no SQL Editor:

```sql
INSERT INTO public.plans (name, description, price_cents, features, sort_order) VALUES
  ('Básico', 'Para pequenos negócios', 9900, '["Até 50 reservas/mês", "Suporte por email"]', 0),
  ('Pro', 'Para restaurantes em crescimento', 19900, '["Reservas ilimitadas", "WhatsApp integrado", "Relatórios"]', 1),
  ('Enterprise', 'Solução completa', 49900, '["Tudo do Pro", "Múltiplos locais", "API"]', 2);
```

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — rodar build de produção
- `npm run lint` — ESLint

## Tecnologias

- Next.js 14 (App Router), React, TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- date-fns, react-day-picker
