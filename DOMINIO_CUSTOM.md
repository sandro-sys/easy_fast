# Configurar domínio easy.rhumarh.com

Este guia configura o app **Easy & Fast** para rodar em **easy.rhumarh.com**. O domínio **rhumarh.com** está no **LocalWeb**; o site em produção está na **Vercel**.

---

## Visão geral

1. **Vercel** — Adicionar o domínio `easy.rhumarh.com` ao projeto e anotar o valor que a Vercel pede no DNS.
2. **LocalWeb** — Criar o registro DNS (CNAME) que aponta `easy` para a Vercel.
3. **Supabase** (opcional) — Incluir a URL do domínio nas redirect URLs do Auth.

---

## 1. Adicionar o domínio na Vercel

1. Acesse [vercel.com](https://vercel.com) e abra o projeto **easy_fast** (ou o nome que você deu).
2. Vá em **Settings** → **Domains**.
3. Em **Add**, digite: **easy.rhumarh.com**
4. Clique em **Add**.
5. A Vercel vai mostrar que o domínio está **Pending** (aguardando DNS) e exibir uma instrução, por exemplo:
   - **Tipo:** CNAME  
   - **Nome / Host:** `easy` (ou `easy.rhumarh.com`, depende do painel)  
   - **Valor / Aponta para:** algo como `cname.vercel-dns.com` ou um endereço específico do projeto (ex.: `easy-fast-xxx.vercel.app`).  
   **Anote exatamente o que a Vercel mostrar** (nome e valor).

Não feche essa tela; você vai usar esses dados no LocalWeb.

---

## 2. Configurar DNS no LocalWeb

Você precisa criar **um registro CNAME** para o subdomínio **easy** no domínio **rhumarh.com**.

1. Entre no painel do **LocalWeb** (onde o domínio rhumarh.com está registrado/administrado).
2. Abra a área de **DNS** / **Registros DNS** / **Gerenciar DNS** do domínio **rhumarh.com**.
3. **Adicionar registro** (ou “Novo registro”):
   - **Tipo:** CNAME  
   - **Nome / Host / Subdomínio:** `easy`  
     (Alguns painéis pedem só `easy`, outros `easy.rhumarh.com`. Use o que o LocalWeb aceitar; o importante é que o subdomínio seja **easy**.)
   - **Valor / Destino / Aponta para:** o **valor** que a Vercel indicou no passo 1 (ex.: `cname.vercel-dns.com` ou o endereço que a Vercel mostrou).  
   - **TTL:** pode deixar padrão (ex.: 3600 ou 1h).
4. Salve o registro.

A propagação do DNS pode levar de alguns minutos até 24–48 horas. Em geral 15–30 minutos é suficiente.

---

## 3. Verificar na Vercel

1. Na Vercel, em **Settings** → **Domains**, ao lado de **easy.rhumarh.com**:
   - Pode aparecer um botão **Refresh** ou **Verify**; use se existir.
2. Quando o DNS estiver correto, o status do domínio muda para **Valid** (ou um ícone de confirmação) e a Vercel associa automaticamente o certificado SSL (HTTPS).

Depois disso, **https://easy.rhumarh.com** deve abrir o seu app.

---

## 4. Supabase (login/cadastro)

Para que o login e o cadastro funcionem em **https://easy.rhumarh.com**:

1. Abra o projeto no [Supabase](https://supabase.com) → **Authentication** → **URL Configuration**.
2. Em **Redirect URLs**, adicione:  
   `https://easy.rhumarh.com/**`  
   (e mantenha a do Vercel se quiser: `https://seu-projeto.vercel.app/**`).
3. Em **Site URL**, você pode colocar:  
   `https://easy.rhumarh.com`  
   para que os e-mails de confirmação e links de redirect usem o seu domínio.
4. Salve.

---

## Resumo

| Onde      | O que fazer |
|----------|-------------|
| **Vercel** | Adicionar domínio `easy.rhumarh.com` e anotar o valor do CNAME. |
| **LocalWeb** | Criar CNAME: nome `easy`, valor = o que a Vercel indicou. |
| **Supabase** | Adicionar `https://easy.rhumarh.com` em Redirect URLs e, se quiser, em Site URL. |

---

## Problemas comuns

- **Domínio “Pending” por muito tempo:** confira no LocalWeb se o CNAME está exatamente como a Vercel pediu (nome e valor, sem espaços). Use “Refresh” na Vercel após alterar o DNS.
- **Certificado SSL:** a Vercel gera o HTTPS automaticamente quando o domínio fica **Valid**; não é preciso configurar certificado no LocalWeb.
- **Só o domínio principal (rhumarh.com) no LocalWeb:** o registro é para o **subdomínio** `easy`; o host/nome do registro deve ser `easy` (ou o que o painel do LocalWeb usar para subdomínios).

Se o painel do LocalWeb tiver nomes diferentes (ex.: “Apontamento”, “Alias”), use a opção que corresponda a **CNAME** e preencha conforme a tabela acima.
