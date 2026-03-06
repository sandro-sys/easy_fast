# Como visualizar o projeto localmente

## Passo a passo

### 1. Abrir o terminal na pasta do projeto

- No Cursor/VS Code: **Terminal** → **Novo Terminal** (ou `` Ctrl+` ``).
- Ou abra o **Prompt de Comando** ou **PowerShell** e navegue até a pasta:
  ```
  cd "\\SANDRO-ASUS\Users\User\Desktop\Feito Pizzas\RHUMA\Programação IA\easy&fast"
  ```
  Se estiver em outro computador, use o caminho da pasta onde está o projeto.

### 2. Instalar as dependências (só na primeira vez)

```bash
npm install
```

### 3. Subir o servidor de desenvolvimento

```bash
npm run dev
```

Aguarde até aparecer algo como:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 4. Abrir no navegador

Abra o endereço no navegador:

**http://localhost:3000**

Você verá a página inicial do sistema de reservas (Reservas – Powered by SO.RH.IA).

---

## Observação sobre o Supabase

Para **login**, **calendário** e **reservas** funcionarem de verdade, é preciso:

1. Criar projeto no [Supabase](https://supabase.com).
2. Colocar a URL e a chave no arquivo `.env.local` (copie de `.env.local.example`).
3. Rodar o SQL do arquivo `supabase/schema.sql` no Supabase.
4. Criar um usuário em **Authentication** no Supabase.

Sem o Supabase configurado, a interface ainda abre e você consegue **visualizar todas as telas** (início, login, calendário, etc.); o que não vai funcionar é salvar dados ou fazer login de fato.
