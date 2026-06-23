# 🔥 Evolve Battle

> "I have no prime. I will evolve until i die."

Aplicação web gamificada para batalha de desenvolvimento pessoal e condicionamento físico entre 2 pessoas. Dark mode, glassmorphism, animações fluidas, pontuação em tempo real, streaks e níveis.

---

## 1. Stack escolhida

| Camada       | Tecnologia                                  | Por quê                                                                 |
|--------------|----------------------------------------------|--------------------------------------------------------------------------|
| Frontend     | **Next.js 15** (App Router) + **TypeScript** | SSR, rotas modernas, ótimo suporte a Supabase                            |
| Estilo       | **Tailwind CSS**                             | Implementa o design system (cores neon, glassmorphism) rapidamente       |
| Animações    | **Framer Motion**                            | Transições suaves, spring physics na PowerBar e nos cards                |
| Backend/DB   | **Supabase** (PostgreSQL)                    | Auth, banco relacional, Row Level Security e Realtime nativos            |
| Deploy       | **Vercel** (free tier)                       | Deploy automático via Git, integra nativamente com Next.js               |

---

## 2. Estrutura de arquivos

```
evolve-battle/
├── app/
│   ├── auth/login/page.tsx       # login + cadastro
│   ├── dashboard/page.tsx        # tela principal da batalha
│   ├── layout.tsx                # fontes + metadata
│   ├── page.tsx                  # redireciona / → /dashboard ou /auth/login
│   └── globals.css               # tema dark, glassmorphism, classe .manifesto
├── components/
│   ├── ui/Button.tsx
│   ├── dashboard/PowerBar.tsx        # elemento de assinatura (barra de embate)
│   ├── dashboard/PlayerCard.tsx      # card de nível/streak
│   ├── dashboard/ActivityFeed.tsx    # histórico em tempo real
│   └── activities/LogActivityModal.tsx
├── lib/
│   ├── supabase/client.ts        # client Supabase (browser)
│   ├── supabase/server.ts        # client Supabase (server)
│   ├── hooks/useBattleData.ts    # hook com fetch + realtime subscription
│   └── utils/{cn,leveling}.ts
├── types/database.ts             # tipos TS espelhando o schema SQL
├── supabase/migrations/001_init_schema.sql   # schema completo do banco
├── middleware.ts                 # protege rotas e renova sessão
└── tailwind.config.js            # paleta neon + tokens de design
```

---

## 3. Passo a passo — Setup do Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Escolha uma senha forte para o banco e selecione a região mais próxima (ex: `South America (São Paulo)`).
3. Aguarde a criação do projeto (~2 min).
4. Vá em **SQL Editor** (menu lateral) → **New query**.
5. Copie todo o conteúdo de `supabase/migrations/001_init_schema.sql` e cole lá. Clique em **Run**.
   - Isso cria as tabelas `profiles`, `activity_types`, `activity_logs`, os triggers de pontuação/streak/nível, e todas as policies de RLS.
6. Vá em **Project Settings → API**. Copie:
   - `Project URL` → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Vá em **Authentication → Providers** e confirme que **Email** está habilitado (vem habilitado por padrão).
   - Opcional: em **Authentication → Settings**, desative "Confirm email" se quiser que vocês dois entrem direto sem precisar clicar em link de confirmação (mais prático para uso entre 2 pessoas).

---

## 4. Passo a passo — Rodando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.local.example .env.local
# edite .env.local com a URL e a anon key copiadas do Supabase

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para a tela de login. Crie sua conta e a do seu primo (cada um com seu e-mail).

> **Importante:** o sistema espera exatamente 2 perfis para a PowerBar funcionar visualmente como "batalha". Funciona com mais perfis também (apareceriam no feed), mas a barra de embate foi desenhada para 2.

---

## 5. Passo a passo — Deploy gratuito na Vercel

1. Suba o projeto para um repositório no GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. Crie uma conta gratuita em [vercel.com](https://vercel.com) (pode logar com GitHub).
3. Clique em **Add New → Project** e selecione o repositório `evolve-battle`.
4. Na tela de configuração, abra **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = (a URL do seu projeto Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (a anon key do seu projeto Supabase)
5. Clique em **Deploy**. Em ~1-2 minutos o site estará no ar em uma URL como `evolve-battle.vercel.app`.
6. Compartilhe esse link com seu primo — qualquer um dos dois pode acessar de qualquer lugar e criar sua conta.

Depois disso, todo `git push` na branch principal gera um novo deploy automático.

---

## 6. Como funciona a pontuação

A fórmula é **duração/quantidade × fator da atividade**, calculada automaticamente no banco (trigger `calculate_points`) sempre que um registro é inserido — isso garante que a pontuação nunca pode ser manipulada direto pelo frontend.

| Atividade   | Unidade  | Pontos/unidade |
|-------------|----------|----------------|
| Musculação  | minuto   | 1.0            |
| Corrida     | km       | 8.0            |
| Natação     | minuto   | 1.2            |
| Calistenia  | minuto   | 1.1            |
| Ciclismo    | km       | 4.0            |
| Caminhada   | km       | 3.0            |

| Hábito       | Unidade  | Pontos/unidade | Meta diária | Bônus ao bater meta |
|--------------|----------|----------------|-------------|----------------------|
| Leitura      | página   | 0.5            | 20 páginas  | +5                    |
| Água         | litro    | 2.0            | 2.5 L       | +5                    |
| Estudo       | minuto   | 0.3            | 60 min      | +8                    |
| Sono em dia  | minuto   | 0.05           | 7h (420min) | +5                    |

Quer ajustar esses números? Edite a tabela `activity_types` direto no **Table Editor** do Supabase — não precisa alterar código nem fazer novo deploy.

**Nível**: cresce em curva quadrática (nível N requer `N×(N-1)×50` pontos acumulados). **Streak**: incrementa todo dia em que pelo menos uma atividade é registrada; quebra se passar um dia inteiro sem registro.

---

## 7. Próximos passos sugeridos

- Tela de histórico completo com filtros por tipo/período
- Notificação (toast) ao bater meta diária ou subir de nível
- Gráfico de evolução semanal (ex: com `recharts`)
- Avatar customizável além do emoji
