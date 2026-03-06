# Passo a passo — Colocar em produção (GitHub + Supabase)

Este guia leva o app **Easy & Fast** até produção usando **GitHub** (código) e **Supabase** (banco e autenticação). O deploy do site será feito na **Vercel** (gratuita e integrada ao GitHub).

---

## Visão geral

| Etapa | O que você faz |
|-------|----------------|
| 1 | Preparar o projeto e subir o código no GitHub |
| 2 | Criar e configurar o projeto no Supabase |
| 3 | Conectar o GitHub à Vercel e configurar variáveis de ambiente |
| 4 | Fazer o primeiro deploy e testar em produção |

---

## 1. Preparar o projeto e subir no GitHub

### 1.1 Garantir que o Git está inicializado

Na pasta do projeto (onde está o `package.json`), no terminal:

```bash
git status
```

Se der erro “not a git repository”, inicialize:

```bash
git init
```

### 1.2 Conferir o `.gitignore`

O `.gitignore` já deve ignorar arquivos sensíveis e pastas de build. Confira se existem estas linhas:

- `.env*.local`
- `.env`
- `node_modules/`
- `.next/`

**Nunca** commite `.env.local` ou `.env` — eles contêm chaves do Supabase.

### 1.3 Fazer o primeiro commit (se ainda não fez)

```bash
git add .
git commit -m "App Easy & Fast - reservas para restaurante"
```

### 1.4 Criar repositório no GitHub e enviar o código

1. Acesse [github.com](https://github.com) e faça login.
2. Clique em **New repository** (ou **+** → **New repository**).
3. Preencha:
   - **Repository name:** por exemplo `easy-and-fast` ou `reservas-restaurante`
   - **Visibility:** Public ou Private (como preferir)
   - **Não** marque “Add a README” se o projeto já tiver arquivos.
4. Clique em **Create repository**.
5. No seu computador, adicione o remote e envie o código (troque `SEU-USUARIO` e `easy-and-fast` pelo seu usuário e nome do repo):

```bash
git remote add origin https://github.com/SEU-USUARIO/easy-and-fast.git
git branch -M main
git push -u origin main
```

Se o repositório já existir e tiver um README, pode ser necessário:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

Pronto: o código está no GitHub.

---

## 2. Configurar o Supabase

### 2.1 Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login (ou crie uma conta).
2. Clique em **New project**.
3. Preencha:
   - **Name:** por exemplo `easy-fast-prod` ou `reservas-prod`
   - **Database Password:** crie uma senha forte e **guarde** (para acesso ao banco; o app usa a chave pública “anon”).
4. Escolha a **região** mais próxima dos seus usuários (ex.: South America).
5. Clique em **Create new project** e aguarde alguns minutos.

### 2.2 Copiar URL e chave anon

1. No menu do projeto: **Settings** (engrenagem) → **API**.
2. Anote:
   - **Project URL** — algo como `https://xxxxxxxx.supabase.co`
   - Em **Project API keys**, a chave **anon public** (longa; é a que o app usa no navegador).

Você vai usar esses dois valores na Vercel na etapa 3.

### 2.3 Criar as tabelas no banco

1. No Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Copie **todo** o conteúdo do arquivo **`supabase/schema.sql`** do seu projeto e cole no editor.
4. Clique em **Run** (ou Ctrl+Enter).
5. Confira que a execução terminou sem erro (mensagem de sucesso).

Isso cria as tabelas `reservations`, `settings`, `closed_dates` e `plans`, com permissões (RLS) para usuários autenticados.

### 2.4 Autenticação por e-mail

1. Vá em **Authentication** → **Providers**.
2. Deixe **Email** habilitado.
3. (Opcional) Em **Email**, ajuste **Confirm email**:
   - Ligado: usuário precisa confirmar o e-mail antes de usar.
   - Desligado: útil para testar logo sem confirmação.

### 2.5 (Opcional) URL de redirecionamento após deploy

Depois que o site estiver no ar (ex.: `https://easy-and-fast.vercel.app`), você pode configurar:

1. **Authentication** → **URL Configuration**.
2. Em **Redirect URLs**, adicione a URL do seu site (ex.: `https://easy-and-fast.vercel.app/**`).

Isso evita problemas de redirect após login/cadastro.

---

## 3. Deploy na Vercel (conectar GitHub + Supabase)

### 3.1 Criar conta e importar o projeto

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar “Continue with GitHub”).
2. Clique em **Add New…** → **Project**.
3. Na lista de repositórios, escolha o repositório do app (ex.: `easy-and-fast`) e clique em **Import**.

### 3.2 Configurar o projeto

1. **Project Name:** pode deixar o sugerido ou alterar (ex.: `easy-and-fast`).
2. **Framework Preset:** deve detectar **Next.js** automaticamente.
3. **Root Directory:** deixe em branco se o código está na raiz do repo.
4. **Build and Output Settings:** em geral não precisa mudar.

### 3.3 Variáveis de ambiente (Supabase)

Antes de dar **Deploy**, adicione as variáveis do Supabase:

1. Na mesma tela de importação, expanda **Environment Variables**.
2. Adicione:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | A **Project URL** do Supabase (ex.: `https://xxxxxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A chave **anon public** do Supabase |

3. Marque os ambientes **Production**, **Preview** e **Development** (ou pelo menos **Production**).
4. Clique em **Deploy**.

A Vercel vai fazer o build e publicar o site. Ao terminar, você recebe uma URL como:

`https://easy-and-fast.vercel.app`

### 3.4 Alterar variáveis depois

Se precisar trocar a URL ou a chave do Supabase:

1. No projeto na Vercel: **Settings** → **Environment Variables**.
2. Edite ou crie `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Faça um novo deploy (**Deployments** → **⋯** no último deploy → **Redeploy**).

---

## 4. Depois do primeiro deploy

### 4.1 Testar o site

1. Acesse a URL que a Vercel mostrou (ex.: `https://easy-and-fast.vercel.app`).
2. Você deve ver a página inicial do **Easy & Fast**.
3. Clique em **Cadastrar**, crie um usuário (e-mail e senha) e faça login.
4. Teste: **Calendário**, **Reservas**, **Configurações**, **Planos**, **Dashboard**.

Se aparecer “Supabase não configurado” ou erro de login, confira as variáveis de ambiente na Vercel (nomes exatos e sem espaços).

### 4.2 Redirect após login (opcional)

Se após login o usuário não for redirecionado corretamente:

1. No Supabase: **Authentication** → **URL Configuration**.
2. Em **Site URL**, coloque a URL do site (ex.: `https://easy-and-fast.vercel.app`).
3. Em **Redirect URLs**, adicione: `https://easy-and-fast.vercel.app/**` (e outras URLs que usar, ex. domínio próprio).

### 4.3 Atualizações futuras

Sempre que você der **push** na branch conectada (ex.: `main`), a Vercel fará um novo deploy automaticamente:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

---

## Resumo rápido

| # | O que fazer |
|---|-------------|
| 1 | Git: `git init` (se precisar), commit, criar repo no GitHub, `git remote add origin ...`, `git push` |
| 2 | Supabase: New project → copiar **URL** e **anon key** → SQL Editor → colar e rodar `supabase/schema.sql` → Auth Email habilitado |
| 3 | Vercel: Import do GitHub → adicionar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Deploy |
| 4 | Abrir a URL do site, Cadastrar primeiro usuário e testar fluxo completo |

---

## Checklist final

- [ ] Código no GitHub (sem `.env` ou `.env.local` no repositório)
- [ ] Projeto Supabase criado
- [ ] Schema SQL executado sem erro
- [ ] Auth com Email habilitado
- [ ] Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Deploy na Vercel concluído
- [ ] Site acessível e login/cadastro funcionando
- [ ] (Opcional) Redirect URLs no Supabase com a URL do site

Se algo falhar, confira: nomes exatos das variáveis na Vercel, URL e anon key corretas (sem espaços no início/fim) e execução completa do `schema.sql` no Supabase.
