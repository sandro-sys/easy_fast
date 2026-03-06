# LGPD e revisão de segurança

Resumo das práticas adotadas no código e no Supabase para proteção de dados e conformidade com a LGPD.

---

## Senhas e autenticação

- **Senhas:** O Supabase (Auth) armazena senhas apenas em forma de **hash** (nunca em texto puro). O aplicativo **não** tem acesso à senha em claro após o envio.
- **Validação de senha:** No cadastro, a senha é validada no cliente (mín. 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais) antes de ser enviada ao Supabase.
- **Confirmação de e-mail:** Para **não** exigir confirmação de e-mail, no Supabase vá em **Authentication** → **Sign In / Providers** → **Email** e desative **Confirm email**. Assim o usuário entra logo após o cadastro.
- **Credenciais:** As chaves do Supabase ficam apenas em variáveis de ambiente (`.env.local` / Vercel). A chave **anon** é pública no front; a **service_role** não é usada no app.

---

## Dados pessoais e LGPD

- **Minimização:** Coletamos apenas o necessário: e-mail (login), dados da empresa (nome, CNPJ, endereço, WhatsApp) e dados de reservas (nome e telefone do cliente).
- **Acesso por empresa:** Reservas e empresas são isoladas por `company_id` / `owner_id`; cada usuário vê apenas os dados da própria empresa (ou os próprios, quando não houver empresa).
- **Painel master:** Apenas o usuário configurado como master (ex.: sandro@rhumarh.com) acessa o painel admin; a verificação é feita no servidor e no banco (função `is_master_user()`).
- **Sem log de senhas:** Nenhum log do app grava senha ou token sensível.

---

## Proteções no código

- **Server Actions:** Operações de escrita (criar reserva, empresa, configuração) são feitas em Server Actions; o cliente não envia SQL nem chaves.
- **RLS (Supabase):** Row Level Security está ativo nas tabelas; políticas limitam leitura/escrita por usuário e, no caso de empresas, por `owner_id` / master.
- **Tipos:** Uso de TypeScript e validação de senha no cadastro reduzem erros e entradas inválidas.
- **Redirect pós-login:** Após login/cadastro, o redirecionamento é para URLs controladas pelo app (ex.: `/onboarding`, `/dashboard`), não para parâmetros arbitrários.

---

## O que você deve fazer

1. **Supabase:** Desative **Confirm email** se não quiser confirmação por e-mail (Authentication → Sign In / Providers → Email).
2. **Variáveis de ambiente:** Nunca commite `.env` ou `.env.local`; use apenas a chave **anon** no front.
3. **HTTPS:** Em produção use sempre HTTPS (a Vercel já fornece).
4. **Política de privacidade:** Mantenha uma política de privacidade atualizada e acessível aos usuários (fora do escopo deste código).

---

## Schema das empresas (multi-tenant)

O arquivo **supabase/schema-companies.sql** adiciona a tabela `companies` e a coluna `company_id` em `reservations`. Execute esse script **depois** do **schema.sql** principal. A função `is_master_user()` no banco permite que apenas o e-mail configurado (ex.: sandro@rhumarh.com) tenha acesso de leitura a todas as empresas no painel master.
