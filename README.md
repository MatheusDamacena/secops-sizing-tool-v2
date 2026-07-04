# SecOps Sizing Engine

Ferramenta de dimensionamento (sizing) para cotação de ingestão do **Google SecOps (Chronicle)**. Converte o inventário de fontes de log de um cliente em **TB/ano**, com validação de EPS/flow, catálogo calibrado por tipo de fonte, sensibilidade e relatório imprimível.

Reescrita como aplicação real em **React + Vite + TypeScript + Tailwind**, com testes, CI/CD e deploy contínuo.

---

## Stack

- **React 18** + **TypeScript** (strict)
- **Vite 5** (build e dev server)
- **Tailwind CSS 3** (temas claro/escuro via `data-theme`)
- **Vitest** (testes unitários da lógica de cálculo)
- **ESLint** (qualidade)
- **GitHub Actions** (CI) + **Vercel** (CD)

## Arquitetura

A regra de negócio é **separada da UI** — isso torna o cálculo testável e a interface substituível.

```
src/
├── types/sizing.ts        # Tipos do domínio (SourceRow, SizingState, SizingResult...)
├── data/
│   ├── catalog.ts         # Catálogo de fontes (MB/dia + fator), modos EDR/SaaS, categorias
│   └── copy.ts            # Textos: avisos e racional dos fatores
├── lib/
│   ├── sizing.ts          # LÓGICA PURA de cálculo (sem React) — o coração da ferramenta
│   └── sizing.test.ts     # Testes unitários da lógica
├── hooks/
│   ├── useSizingState.ts  # Estado + operações (add/remove/override de linhas)
│   └── useTheme.ts        # Tema claro/escuro
├── components/            # UI (Header, seções, rail, relatório, donut...)
├── App.tsx                # Composição do layout
└── main.tsx               # Entry point
```

**Princípio-chave da metodologia:** o EPS real é apenas cross-check; o cálculo é **aditivo por fonte** (`qtd × MB/dia/item × fator ÷ 1024`), nunca uma média ponderada — que se distorce quando uma fonte tem contagem muito alta. Flow (NetFlow/IPFIX) é métrica separada e só entra se não estiver incluso no EPS.

---

## Rodando localmente

Pré-requisito: **Node.js 20+**.

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento (http://localhost:5173)
npm run dev

# 3. Outros comandos
npm run build       # build de produção -> dist/
npm run preview     # servir o build localmente
npm test            # rodar testes
npm run lint        # linter
npm run typecheck   # checagem de tipos
```

---

## Deploy: máquina local → GitHub → Vercel

### 1. Máquina local → GitHub

```bash
# na raiz do projeto
git init
git add .
git commit -m "feat: SecOps Sizing Engine em React+Vite+TS"
git branch -M main

# crie um repositório vazio no GitHub (sem README), então:
git remote add origin https://github.com/<SEU_USUARIO>/secops-sizing-engine.git
git push -u origin main
```

A partir do primeiro push, o **CI (GitHub Actions)** roda automaticamente: lint → typecheck → testes → build. O status aparece na aba **Actions** do repositório e em cada Pull Request.

### 2. GitHub → Vercel (deploy contínuo)

**Opção A — pelo site (recomendado):**

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. **Add New → Project** e selecione o repositório `secops-sizing-engine`.
3. A Vercel detecta o Vite automaticamente (o `vercel.json` já está configurado). Confirme:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**. Em ~1 min você recebe a URL de produção.

Depois disso, **todo push na branch `main` faz deploy automático** para produção, e cada Pull Request ganha uma **Preview URL** própria.

**Opção B — pela CLI:**

```bash
npm i -g vercel
vercel          # primeiro deploy (preview) — siga o assistente
vercel --prod   # deploy de produção
```

### Fluxo completo de CI/CD

```
git push  →  GitHub Actions (lint, typecheck, test, build)
          →  Vercel: Preview (em PR) / Produção (na main)
```

---

## Metodologia de cálculo

- **TB/ano (log)** = Σ (`qtd × MB/dia/item × fator ÷ 1024`) × 365 ÷ 1024
- **TB/ano (flow)** = `registros/min × 60 × 24 × 365 × bytes/registro ÷ 10¹²` (só se separado do EPS)
- **Número final** = (log + flow) × (1 + margem de crescimento)
- **Fatores** são estimativas de referência de mercado — sobrescreva por linha com dado real do cliente sempre que possível (a coluna vira âmbar quando editada).

> **Aviso comercial:** esta é uma estimativa de pré-venda. O dimensionamento final deve ser confirmado com um piloto de ingestão real, que captura sazonalidade e picos que nenhuma calculadora prevê.

---

## Licença

Uso interno — SecMath.
