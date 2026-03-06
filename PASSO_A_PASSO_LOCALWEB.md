# Passo a passo — Configurar easy.rhumarh.com no LocalWeb (DNS)

Use este guia para criar o registro **CNAME** no painel do domínio **rhumarh.com** (LocalWeb / Locaweb), para que **easy.rhumarh.com** aponte para a Vercel.

---

## Antes de começar

Na **Vercel** (Settings → Domains), você já deve ter adicionado **easy.rhumarh.com**. Anote o **valor** que a Vercel pede para o DNS (ex.: `cname.vercel-dns.com` ou `easy-fast-efg1.vercel.app`). Você vai colar esse valor no LocalWeb.

---

## Passo 1 — Entrar no painel

1. Acesse o site do **LocalWeb** (ou **Locaweb**) e faça login na **Central do Cliente**.
2. Vá em **Meus Produtos** e localize **Registro de domínio** (ou **Domínios**).
3. Clique para administrar o produto de domínio.
4. Na lista de domínios, encontre **rhumarh.com** e clique em **Administrar** (ou no nome do domínio).

---

## Passo 2 — Abrir a Zona DNS

5. Na página do domínio **rhumarh.com**, role até a seção **Zona DNS** (pode estar como “Registros DNS” ou “Gerenciar DNS”).
6. Clique em **Editar zona DNS** (ou em “Adicionar entrada” / “Gerenciar registros”, dependendo do painel).

---

## Passo 3 — Adicionar o registro CNAME

7. Clique em **Adicionar entrada** (ou “Novo registro”, “Adicionar registro”).
8. Em **Tipo de entrada** (ou “Tipo”), selecione **CNAME** (não use A, AAAA ou MX).
9. Preencha os campos:

| Campo no painel | O que colocar |
|-----------------|----------------|
| **Entrada** / **Nome** / **Host** / **Subdomínio** | `easy` (só a palavra easy; em alguns painéis pode ser “easy.rhumarh.com”) |
| **Conteúdo** / **Valor** / **Aponta para** / **Destino** | O valor que a **Vercel** mostrou (ex.: `cname.vercel-dns.com` ou `easy-fast-efg1.vercel.app`) — copie e cole exatamente. |
| **Prioridade** | Deixe em branco ou padrão (CNAME não usa). |
| **TTL** | Pode deixar o padrão (ex.: 3600). |

10. Clique em **Adicionar entradas** (ou “Salvar”, “Confirmar”).

---

## Passo 4 — Conferir

11. Na lista da Zona DNS, confira se existe uma linha com:
    - **Tipo:** CNAME  
    - **Nome/Entrada:** easy (ou easy.rhumarh.com)  
    - **Conteúdo/Valor:** o mesmo que a Vercel indicou  
12. Aguarde a propagação (geralmente 15–30 minutos; pode levar até 24–48 h).
13. Na **Vercel**, em Settings → Domains, clique em **Refresh** ao lado de **easy.rhumarh.com**. Quando o status ficar **Valid**, o site estará no ar em **https://easy.rhumarh.com**.

---

## Resumo rápido

- **Tipo:** CNAME  
- **Nome/Entrada:** easy  
- **Conteúdo/Valor:** (valor que a Vercel mostrou para easy.rhumarh.com)

Se o painel tiver nomes diferentes (ex.: “Apontamento”, “Alias”), use a opção que corresponda a **CNAME** e preencha nome = **easy** e destino = valor da Vercel.
