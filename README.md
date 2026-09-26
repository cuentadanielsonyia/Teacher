# 🎓 ProfeInglés — Profesor de inglés adaptativo (B1 → C2)

Web interactiva que enseña inglés con lecciones adaptativas de **speaking, listening, writing y reading**,
corrección gramatical real con consejos hablados, repetición espaciada y subida de nivel automática.
Todo a **coste cero**, sin cuentas de terceros para el alumno (single-user).

- **Prod:** `https://teacher-daniel-ia.vercel.app` (scope Vercel `daniel-ia`, proyecto `teacher`)
- **Repo:** `https://github.com/cuentadanielsonyia/Teacher.git` (branch `main`, auto-deploy activado)
- **Docs del proceso:** `PLAN.md` (arquitectura) · `TASKS.md` (T01–T18) · `CHANGELOG.md` (cada cambio)

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 · Drizzle ORM + SQLite (`better-sqlite3`)
· Zod · Vitest · Web Speech API del navegador (TTS + STT, gratis, sin claves).

## Requisitos (PC nuevo)

- Node.js 24 + npm (el proyecto usa `better-sqlite3` nativo; tras `npm install` funciona en Windows).
- CLI Vercel (`npm i -g vercel`) solo para deploy/logs. Cuenta Vercel `cuentadanielsonyia` (scope `daniel-ia`).
- Navegador Edge/Chrome (micrófono + voces EN/ES para speaking/listening).

## Puesta en marcha en un PC nuevo (5 min)

```bash
git clone https://github.com/cuentadanielsonyia/Teacher.git
cd Teacher
npm install
# 1) Crear .env.local con:
#    DATABASE_URL=file:./data/teacher.db
npx drizzle-kit migrate   # crea data/teacher.db con las 4 tablas
npm run dev               # http://localhost:3000
```

Comandos útiles:

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build prod (verifica tipos + rutas) |
| `npm run start -- -p 3100` | Servir el build para pruebas |
| `npx vitest run` | Tests (27: adapt, grade, checks, modes, exercises) |
| `npx drizzle-kit generate` / `migrate` | Migraciones SQLite (`drizzle/`) |
| `node scripts/check-db.mjs` | Ver tablas de `data/teacher.db` |
| `vercel link` | Vincular carpeta al proyecto `daniel-ia/teacher` |
| `vercel logs --environment production` | Logs de prod (sin `\| Select-Object`, da error) |
| `vercel ls` | Deploys (cada push a `main` despliega solo) |

> `.env.local`, `data/*.db` y `.vercel/` están en `.gitignore`: **no viajan con el repo**,
> se recrean con los pasos de arriba. En el PC nuevo hay que repetir `vercel link`
> y aceptar la Vercel GitHub App si pide reconectar (`vercel git connect …`).

## Cómo funciona

- **Lección → corrección → registro → siguiente ajustada.** `GET /api/lesson/next` elige
  ejercicio por modo/skill/categoría, racha de errores y repaso SRS vencido, sin repetir
  lo ya intentado (banco de 193, `data/exercises.json`). `POST /api/lesson/grade` corrige:
  igualdad normalizada en cerradas, **corrector gramatical** en abiertas
  (`lib/checks.ts`: have+participio, don't 3ª persona, be, was/were, there is plural,
  for I→me, a/an, respuesta corta) + detalles que no suspenden (I mayúscula, punto).
- **Adaptación** (`lib/adapt.ts`): peso por errores + 3 aciertos seguidos = subida
  B1 → B1+ → B2 → B2+ → C1 → C1+ → **C2**; vocab fallado vuelve en 2^fallos días.
- **Voz** (`lib/useSpeech.ts`): conversación multi-turno con TTS, dictado con 6 errores
  guiados en español, lectura en voz alta con % (`lib/grade.ts:scoreReading`),
  listening con velocidad 1x/0.75x y transcripción, feedback hablado bilingüe (EN+ES).
- **Progreso** (`GET /api/progress`): precisión, errores top, vocab visto/dominado,
  tiempo/sesiones, racha diaria y escalera B1→C2.

## Estructura

```
app/                  → /, /lesson (mixto), /practice?mode= (4 skills), /progress
app/api/lesson|progress|session → Route Handlers (Next 16: Response.json, no caché)
lib/                  → adapt, checks, grade, modes, exercises, useSpeech (+ tests)
components/practice/  → SpeakingFlow, ListeningFlow, TextFlows, shared
src/db/               → schema.ts + index.ts (DDL idempotente en arranque)
data/exercises.json   → banco validado con Zod (id, skill, category, level, prompt,
                        answer, tip?, accept?, mode?, passage?, speak?)
drizzle/              → migraciones SQL · scripts/check-db.mjs → inspección local
.agents/skills/       → 7 skills instaladas · skills-lock.json → manifiesto
opencode.json         → 3 MCP (github OAuth, postgres por env, playwright)
```

## Decisiones y límites conocidos

1. **SQLite, no Postgres** (restricción coste-cero del 2026-09-26): local persiste en
   `data/teacher.db`; en Vercel serverless usa `/tmp/teacher.db` (**efímero por instancia**).
   Persistencia real multi-instancia = pendiente (Turso/Neon free requieren aceptar sus
   ToS en el dashboard; 1 clic, documentado en CHANGELOG T12).
2. **Vercel Deployment Protection** pide login a anónimos; el dueño entra directo.
   Hacerla pública = 1 toggle en `teacher/settings/deployment-protection`.
3. Corrector sin IA: caza los errores frecuentes listados arriba; para redacción libre
   profunda (estilo, coherencia) haría falta un LLM con API key (fase futura).
4. No tocar sin confirmación: secretos/`env`, proyecto Vercel, aceptaciones legales
   (marketplace), borrado de datos. El resto se commitea y pushea con entrada en
   `CHANGELOG.md` (flujo: escribir → testear → documentar → commit → push).

## Estado

T01–T18 completados (ver `TASKS.md`). Último: T18 corrector gramatical + feedback
hablado burbuja a burbuja, verificado en prod (páginas y ciclo next/grade 200).
