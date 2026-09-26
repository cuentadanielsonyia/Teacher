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
