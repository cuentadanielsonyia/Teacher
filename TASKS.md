# TASKS.md — MVP Profesor Inglés (aprobado PLAN e01d8cf)

Leyenda: `[ ] pendiente` / `[x] hecha`. Cada tarea: descripción, aceptación, dependencias.
Regla: `escribir → testear → CHANGELOG → commit → push`. Infra/env (Vercel link, Postgres, secretos) requiere confirmación explícita.

## Fase 3 — Scaffold y base
- [x] T01 Scaffold Next.js App Router + TS + Tailwind en `Teacher/`
  - Aceptación: `npm run dev` arranca, `/` responde 200, `npm run build` OK.
  - Dep: ninguna.
  - Resultado: OK 2026-09-26, `npm run build` Next 16.3.6 OK, coste cero (solo deps npm free).
- [x] T02 `vercel link` + crear proyecto Vercel en scope `daniel-ia` (CONFIRMAR)
  - Aceptación: `vercel project ls` muestra `teacher`, preview URL responde.
  - Dep: T01.
  - Resultado: OK 2026-09-26, `daniel-ia/teacher` linkado y GitHub `cuentadanielsonyia/Teacher` conectado (verificado `already connected`).
- [x] T03 SQLite local coste cero + `DATABASE_URL` en `.env.local` (pivote desde Postgres por restricción coste cero)
  - Aceptación: `data/teacher.db` se crea, `SELECT 1` OK, `.env.local` sin secretos pagos.
  - Dep: T02.
  - Resultado: OK 2026-09-26, 4 tablas + `__drizzle_migrations`.
- [x] T04 Drizzle ORM sqlite + schema `profile, attempts, vocab, sessions` + migraciones
  - Aceptación: `drizzle-kit generate + migrate` OK, tablas existen.
  - Dep: T03.
  - Resultado: OK 2026-09-26, `drizzle/0000_curved_iceman.sql` aplicado.
  - Nota: no persiste en Vercel serverless (pendiente Turso free para prod).

## Fase 4 — Dominio adaptativo
- [x] T05 `lib/adapt.ts`: peso categoría + subida dificultad tras 3 aciertos + SRS `2^fallos`
  - Aceptación: `vitest lib/adapt.test.ts` 6+ casos pasan (peso, subida, repaso).
  - Dep: T01.
  - Resultado: OK 2026-09-26, 6/6 tests.
- [x] T06 Banco local `data/exercises.json` B1-B2 (conversación, gramática, vocab, writing, pronunciación-texto)
  - Aceptación: 30+ ejercicios con `{id, skill, category, level, prompt, answer}` válido por schema zod.
  - Dep: T01.
  - Resultado: OK 2026-09-26, 32 ejercicios + `lib/exercises.ts` validados.
- [x] T07 `GET /api/lesson/next` según nivel y pesos
  - Aceptación: devuelve JSON `{prompt, skill, category, difficulty}`, test integración con DB mock pasa.
  - Dep: T04, T05, T06.
  - Resultado: OK 2026-09-26, integración `next→grade→progress` en `:3100` verificada.
- [x] T08 `POST /api/lesson/grade` + registro `attempt/vocab` + corrección categorizada
  - Aceptación: corrige may/min, guarda intento, devuelve `{correct, corrections[]}`, test pasa.
  - Dep: T04, T05.
  - Resultado: OK 2026-09-26, corrección + `vocab` update verificados (intento test limpiado).
- [x] T09 `GET /api/progress` agregados (errores top, vocab, racha, tiempo, nivel/skill)
  - Aceptación: tras 3 intentos, dashboard JSON refleja conteos y racha.
  - Dep: T04, T08.
  - Resultado: OK 2026-09-26, `total/correct/errorsTop/vocab/time/streak/level` verificados.

## Fase 5 — UI + DoD
- [ ] T10 UI `/lesson`: chat, respuesta, corrección visible, Next ajustado
  - Aceptación: manual + Playwright MCP: completar lección sin errores JS.
  - Dep: T07, T08.
- [ ] T11 UI `/progress` + persistencia recarga
  - Aceptación: recargar no pierde datos (lee de DB), racha y tiempo visibles.
  - Dep: T09.
- [ ] T12 Deploy prod Vercel + verificación DoD MVP
  - Aceptación: URL prod carga, ciclo completo en prod, `CHANGELOG` y `TASKS` al día.
  - Dep: T10, T11.

## Skills/MCP instaladas (tras aprobación 2026-09-26)
- Skills (6): vercel-react-best, frontend-design, shadcn, teach, language-learning, TDD-debugging — pendiente instalar project-local.
- MCP (3): Vercel-Postgres, GitHub, Playwright — pendiente configurar.
