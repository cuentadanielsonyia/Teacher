# CHANGELOG.md

## 2026-09-26 — chore: checkpoint inicial antes de cambios
- Qué: `git commit --allow-empty -m "chore: checkpoint inicial antes de cambios"` (11d4dac), push `main -> origin/main`.
- Por qué: Fase 0, base reversible (repo estaba vacío).
- Test: `git log --oneline`, `git status clean`, `git push -u origin main` OK como `cuentadanielsonyia` tras `cmdkey /delete` de credencial `DilesZ`.
- Resultado: OK.

## 2026-09-26 — auth GitHub + Vercel
- Qué: Confirmado GitHub `cuentadanielsonyia` en Edge. Vercel CLI `logout/login` con Edge como default → `vercel whoami = cuentadanielsonyia`, scope `daniel-ia`.
- Por qué: Fase 0 regla 3, sin credenciales no continuar con push/deploy.
- Test: `vercel whoami`, `vercel project ls` (0 proyectos en `daniel-ia`), `git push` 403→OK tras limpiar credencial.
- Resultado: OK. Nota: no hay proyecto Vercel Teacher existente, habrá que crearlo (pendiente confirmación infra).

## 2026-09-26 — docs: PLAN.md Fase 2 aprobado + TASKS.md
- Qué: `PLAN.md` aprobado (Next.js + Vercel Postgres + Drizzle, MVP texto). `TASKS.md` con T01-T12 granulares.
- Archivos: `PLAN.md`, `TASKS.md`.
- Test: `Test-Path TASKS.md`, lectura manual.
- Resultado: OK.

## 2026-09-26 — skills: 6/7 instaladas project-local
- Qué: `npx skills add -a opencode` en `Teacher/`: vercel-react-best-practices, frontend-design, shadcn, teach, test-driven-development, systematic-debugging → `.agents/skills/` + `skills-lock.json`.
- Por qué: Aprobación explícita 2026-09-26 (6 skills).
- Test: `Get-ChildItem .agents/skills/SKILL.md` 6 ficheros, security Safe/Low (shadcn Med).
- Resultado: OK parcial. `openclaw/skills:language-learning` falló (auth failed, repo privado/renombrado) — pendiente alternativa sin asumir.

## 2026-09-26 — mcp: github + postgres + playwright configurados
- Qué: `opencode.json` con 3 MCP aprobados (github remote OAuth, postgres local via `{env:DATABASE_URL}`, playwright local). Sin secretos en repo.
- Por qué: Aprobación explícita 2026-09-26 (3 MCP).
- Test: `node JSON.parse opencode.json` valid. `opencode mcp list` no disponible en PATH (CLI no instalado), pendiente verificar tras reinicio OpenCode.
- Resultado: OK parcial. Siguiente: `opencode mcp auth github` (OAuth navegador Edge) y `DATABASE_URL` tras T03.

## 2026-09-26 — skills: english-coach instalada (alternativa)
- Qué: `npx skills add tianmind-studio/english-coach -a opencode` → `.agents/skills/english-coach`. Total 7 skills.
- Por qué: `openclaw/skills:language-learning` falló (auth), aprobada alternativa `english-coach`.
- Test: `SKILL.md` existe, Safe/Low.
- Resultado: OK.

## 2026-09-26 — T01 scaffold Next.js OK (coste cero)
- Qué: `create-next-app teacher` en temp + copia a `Teacher/` (sin `.git/node_modules/.next`). `npm install`, `npm run build` Next 16.3.6 OK.
- Archivos: `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, etc.
- Test: `npm run build` compiled successfully, 4/4 static pages. `npm run dev` pendiente verificación manual `/` 200.
- Resultado: OK. Coste cero verificado (solo Hobby free, sin añadidos pago).

## 2026-09-26 — T02 vercel link OK parcial
- Qué: `vercel link --yes -p teacher` → `daniel-ia/teacher` creado, `.vercel/` ignorado. `vercel project ls` lista `teacher`.
- Por qué: T02, base deploy. Coste cero (Hobby, sin Postgres aún).
- Test: `vercel project ls`, `Test-Path .vercel`.
- Resultado: OK parcial. GitHub connect falló (falta Vercel GitHub App OAuth) — pendiente manual. T03 Postgres sin CLI (`storage` no existe en CLI 53.4) — pendiente crear vía dashboard free tier.

## 2026-09-26 — T03+T04 SQLite + Drizzle OK (pivote coste cero)
- Qué: `drizzle-orm + better-sqlite3 + drizzle-kit` (free). `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`, `.env.local`, `drizzle/0000_curved_iceman.sql` aplicado a `data/teacher.db` (gitignored).
- Por qué: restricción activa coste cero + `vercel storage` sin CLI. Pivote aprobado `Usar SQLite`.
- Test: `drizzle-kit generate/migrate` OK, `node scripts/check-db.mjs` 4 tablas, `npm run build` Next 16.3.6 OK.
- Resultado: OK local. Limitación: SQLite no persiste en Vercel serverless — prod requerirá Turso/Neon free (cero coste) posterior. GitHub connect Vercel sigue bloqueado (2 intentos CLI 400) — requiere 1 clic tuyo en Edge (`teacher/settings/git` + `github.com/apps/vercel` ya abiertos).

## 2026-09-26 — T05 adapt.ts OK
- Qué: `lib/adapt.ts` (peso, level-up >=3, SRS) + `lib/adapt.test.ts` 6 casos + `vitest` + `@types/node@24` (fix peer).
- Test: `npx vitest run lib/adapt.test.ts` 6 passed.
- Resultado: OK. Coste cero.

## 2026-09-26 — T02 GitHub conectado + T06-T09 APIs OK
- Qué: `vercel git connect` → `already connected`. `data/exercises.json` 32 ejercicios, `lib/exercises.ts` zod, `app/api/lesson/next|grade`, `app/api/progress`. `zod` verificado.
- Test: `npm run build` 3 routes dinámicas OK. Integración `:3100`: `next(g06 articles)` → `grade wrong→correct:false` → `progress total:1 errorsTop:articles`. DB limpiada a 0 intentos.
- Resultado: OK. Ciclo MVP sin UI completo.
