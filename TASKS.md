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
- [x] T10 UI `/lesson`: chat, respuesta, corrección visible, Next ajustado
  - Aceptación: manual + Playwright MCP: completar lección sin errores JS.
  - Dep: T07, T08.
  - Resultado: OK 2026-09-26, `/lesson` 200, ciclo next→grade→next verificado vía API, build 10/10.
- [x] T11 UI `/progress` + persistencia recarga
  - Aceptación: recargar no pierde datos (lee de DB), racha y tiempo visibles.
  - Dep: T09.
  - Resultado: OK 2026-09-26, `/progress` 200, `POST /api/session 90s` → streak:1 timeSec:90 (limpiado a 0 tras test).
- [x] T12 Deploy prod Vercel + verificación DoD MVP
  - Aceptación: URL prod carga, ciclo completo en prod, `CHANGELOG` y `TASKS` al día.
  - Dep: T10, T11.
  - Resultado: OK 2026-09-26 con salvedades: `https://teacher-daniel-ia.vercel.app` UI 200, APIs prod 200 (`next/grade/session` en logs). Persistencia prod por instancia (/tmp efímero). Vercel Deployment Protection pide login a anónimos (owner en Edge lo ve sin problema).
- [x] T13 Pulido diseño + usabilidad (post-MVP)
  - Aceptación: build OK, `/`, `/lesson`, `/progress` 200, UI en español con dark mode.
  - Resultado: OK 2026-09-26. Header/nav + hero home, lección con chips/contador/racha/Ctrl+Enter/skeletons, progreso con anillo/barras/empty-state.
- [x] T14 Adaptación cableada + tests corrector (post-MVP)
  - Aceptación: 12/12 vitest, level-up B1→B1+ tras 3 seguidas verificado, SRS review:true verificado, build OK.
  - Resultado: OK 2026-09-26. `lib/grade.ts` + tests, `grade` con racha/level-up/SRS, `next` con repaso vencido + perfil, banner de nivel en UI.
- [x] T15 Camino a nativo C2 (post-MVP)
  - Aceptación: 17/17 vitest, banco 100+, escalera 7 niveles, rotación sin repeticiones, tips visibles.
  - Resultado: OK 2026-09-26. Escalera B1→C2, 139 ejercicios (phrasal, idioms, collocations, inversión, clefts, mixtas, registro, matices, IPA/estrés), `accept[]`, `tip` en grade + UI, `vitest.config.ts`, escalera visual en progreso.

## Skills/MCP instaladas (tras aprobación 2026-09-26)
- Skills (6): vercel-react-best, frontend-design, shadcn, teach, language-learning, TDD-debugging — pendiente instalar project-local.
- MCP (3): Vercel-Postgres, GitHub, Playwright — pendiente configurar.
