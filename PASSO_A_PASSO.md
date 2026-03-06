# Passo a passo — Colocar o app Reservas para funcionar

Siga esta ordem para ter o sistema funcionando com login, calendário, reservas e métricas.

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login (ou crie uma conta).
2. Clique em **New project**.
3. Preencha:
   - **Name:** por exemplo `reservas-restaurante`
   - **Database Password:** crie uma senha forte e guarde (para o banco; o app usa a chave anon).
4. Escolha a região e clique em **Create new project**.
5. Aguarde o projeto ficar pronto (alguns minutos).

---

## 2. Copiar URL e chave da API

1. No menu do projeto, vá em **Settings** (ícone de engrenagem) → **API**.
2. Anote:
   - **Project URL** (ex.: `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon public** (chave longa; é a que o app usa no navegador).

---

## 3. Configurar variáveis de ambiente no seu computador

1. Na raiz do projeto (pasta onde está o `package.json`), crie o arquivo **`.env.local`** (se ainda não existir).
2. Coloque o conteúdo abaixo e troque pelos valores do seu projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

3. Salve o arquivo. **Não** commite `.env.local` no Git (ele já deve estar no `.gitignore`).

---

## 4. Criar as tabelas no Supabase

1. No Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Cole todo o conteúdo do arquivo **`supabase/schema.sql`** (está na pasta do projeto).
4. Clique em **Run** (ou Ctrl+Enter).
5. Confirme que a execução terminou sem erro (mensagem de sucesso no rodapé).

Isso cria as tabelas `reservations`, `settings`, `closed_dates` e `plans`, com permissões básicas para usuários autenticados.

---

## 5. Habilitar login por e-mail

1. No Supabase, vá em **Authentication** → **Providers**.
2. Deixe **Email** habilitado (padrão).
3. (Opcional) Em **Email Auth**, configure:
   - **Confirm email:** ligado se quiser que o usuário confirme o e-mail antes de usar; desligado para testar logo sem confirmação.

Usuários poderão se cadastrar em **Cadastrar** e entrar em **Entrar** com e-mail e senha.

---

## 6. Criar o primeiro usuário

1. No seu projeto, suba o app (veja passo 7) e acesse a página inicial.
2. Clique em **Cadastrar**.
3. Informe e-mail e senha e finalize o cadastro.
4. Se tiver “Confirm email” ativo, confirme pelo link no e-mail; depois faça **Entrar**.

Esse usuário já pode usar o sistema (calendário, reservas, configurações, planos).

---

## 7. Subir o app no seu computador

1. Abra o terminal na pasta do projeto.
2. Instale as dependências (se ainda não fez):

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   node ./node_modules/next/dist/bin/next dev
   ```

   Se a pasta do projeto **não** tiver `&` no nome, você pode usar:

   ```bash
   npm run dev
   ```

4. Acesse no navegador: **http://localhost:3000**

Você deve ver a página inicial, conseguir **Cadastrar**, **Entrar**, e usar **Calendário**, **Reservas**, **Configurações**, **Planos** e **Dashboard**.

---

## 8. (Opcional) Valor padrão de “limite por horário”

- O app usa a configuração **Limite de reservas por horário** (em **Configurações**).
- Se quiser um valor padrão antes de alguém salvar, você pode inserir na tabela `settings` pelo SQL Editor:

```sql
INSERT INTO settings (key, value, updated_at)
VALUES ('reservation_limit_per_slot', '10', now())
ON CONFLICT (key) DO NOTHING;
```

(10 = até 10 reservas por horário; altere o número se quiser.)

---

## 9. (Opcional) Planos no banco

- A página **Planos** usa os planos definidos no código (Trial, Starter, Pro) quando não há planos no Supabase.
- Se quiser gerenciar planos pelo banco, insira linhas na tabela `plans` (campos: `name`, `description`, `price_cents`, `features`, `active`, `sort_order`). O app já está preparado para ler da tabela `plans` quando houver dados.

---

## Resumo rápido

| Passo | O que fazer |
|-------|------------------|
| 1 | Criar projeto no Supabase |
| 2 | Copiar **Project URL** e **anon key** em Settings → API |
| 3 | Criar `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 4 | Rodar o SQL de `supabase/schema.sql` no SQL Editor |
| 5 | Deixar Auth com Email habilitado |
| 6 | Cadastrar primeiro usuário pelo app |
| 7 | Rodar `node ./node_modules/next/dist/bin/next dev` e abrir http://localhost:3000 |

Se algo falhar, confira: URL e anon key corretas no `.env.local`, tabelas criadas sem erro e usuário logado ao acessar as páginas internas.
