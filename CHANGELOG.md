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

## 2026-09-26 — docs: PLAN.md Fase 2 propuesto
- Qué: `PLAN.md` con auditoría (repo vacío, sin Vercel project), arquitectura Next.js + Vercel Postgres + Drizzle, adaptación v1, tablas skills.sh y MCP sin instalar.
- Archivos: `PLAN.md`.
- Test: `Test-Path PLAN.md`, lectura manual.
- Resultado: Pendiente aprobación para Fase 3.
