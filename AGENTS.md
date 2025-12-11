# Agents
## Repository summary

- Framework: Next.js (app directory) — see `package.json` (`next` dependency).
- Package manager: `pnpm` (`pnpm@10` in `package.json`).
- Node engine target: `node >= 24` (see `package.json` `engines`).
- Key scripts:
	- `pnpm dev` — starts the Next dev server (`next dev`).
	- `pnpm build` — builds the Next app.
	- `pnpm start` — runs the production server.
	- `pnpm run generateEnvDeclaration` — script that reads `.env.development` and generates `env.d.ts`.

Code organization highlights:

- `src/` — application sources
- `src/app/` — Next.js app routes and server components.
- `src/app/admin/` — admin interface routes.
- `src/components/` — UI components.
- `src/hooks/` — custom React hooks.
- `src/dsfr/` — DSFR like components, hooks, and layouts (client and server).
- `src/lib/` — library code (utilities, helpers, db repositories).
- `src/config.ts` — central configuration reading `process.env` keys; useful for discovering required env vars.
- `scripts/` — utility scripts (e.g. `generateEnvDeclaration.ts`).


## Change log

- 2025-12-08: Initial `AGENTS.md` created.
