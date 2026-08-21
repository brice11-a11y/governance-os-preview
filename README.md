# Governance OS — Preview

An LLM-guided web app that helps product teams design better experiments and scores hypothesis quality.

## Architecture

Two independent Node.js services + one external LLM API:

- **`app/`** — Next.js 15 frontend (React, TypeScript, Tailwind v4, shadcn/ui)
- **`coach/`** — Hono backend that wraps Claude (Anthropic) for scoring and validation
- **Anthropic API** — Claude Sonnet, called from the backend only

No database. No user accounts. Basic Auth on the frontend if you set the env vars.

## Run locally

```bash
# Backend (port 8787)
cd coach && npm install && npm run dev

# Frontend (port 3000) — in another terminal
cd app && npm install && npm run dev
```

Required env vars:

| Var | Where | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `coach/.env` | Claude API access |
| `NEXT_PUBLIC_COACH_URL` | `app/.env.local` | e.g. `http://localhost:8787` |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` | `app/.env.local` (optional) | Enables Basic Auth on all app routes |

## Deploy to Vercel

Two separate Vercel projects, both pointing at the same repo:

1. **`coach/`** — deploy as a Node.js service. Set `ANTHROPIC_API_KEY`. Note the URL (e.g. `https://exp-os-coach.vercel.app`).
2. **`app/`** — deploy as a Next.js app. Set `NEXT_PUBLIC_COACH_URL` to the coach URL above, plus `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/health` | Liveness |
| POST | `/v1/coach/score/hypothesis-source` | Score the "source of hypothesis" input |
| POST | `/v1/coach/validate/idea` | Validate an experiment idea |
| POST | `/v1/coach/validate/step-input` | Validate a coach step input |

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Recharts · Hono · `@anthropic-ai/sdk` · Vitest.

## License

Preview / demo — not for redistribution.
