# PLAN.md — Profesor de Inglés Adaptativo (MVP)

Fecha: 2026-09-26
Estado: Propuesto, pendiente aprobación para Fase 3
Scope Vercel: `daniel-ia` (usuario `cuentadanielsonyia`) — sin proyectos previos
Repo: `https://github.com/cuentadanielsonyia/Teacher.git` (branch `main`, checkpoint `chore: checkpoint inicial`)

## 1. Auditoría repo actual
- `git log`: solo `11d4dac chore: checkpoint inicial antes de cambios` (empty commit).
- `Teacher/` vacío salvo `.git`. No hay `package.json`, ni backend/DB, ni config Vercel.
- `vercel project ls` en scope `daniel-ia`: `No projects found`. No hay proyecto Vercel existente conectado (contradice supuesto inicial).
- `vercel whoami`: `cuentadanielsonyia` OK. `git push -u origin main` OK tras limpiar credencial `DilesZ`.
- Conclusión: scaffold desde cero Vercel-native.

## 2. Especificación aprobada (Fase 1)
- Nivel B1-B2. Foco: Conversación, Gramática, Vocabulario, Writing, Pronunciación. No examen.
- Modalidad MVP: solo texto (audio STT/TTS diferido a fase 2, acordado).
- Single-user, sin login terceros.
- Métricas: errores/categoría, vocab visto/dominado, tiempo sesión, racha días, nivel por skill.
- Adaptación mixta: SRS errores + subir dificultad tras N aciertos.
- MVP: `lección → respuesta → corrección → registro → siguiente ajustada + persistencia tras recarga`.

## 3. Arquitectura propuesta
- **Frontend:** Next.js 14+ App Router + TypeScript + Tailwind. Rutas `/`, `/lesson`, `/progress`.
  - `/lesson`: chat texto, muestra corrección categorizada, botón Next.
  - `/progress`: racha, tiempo, errores top, vocab, nivel por skill.
  - Estado: Server Components + fetch API; `localStorage` solo caché, DB fuente verdad.
- **Backend (Route Handlers):**
  - `GET /api/lesson/next` → lee agregados, elige skill/categoría con peso, genera o elige ejercicio (banco local JSON en MVP, LLM después).
  - `POST /api/lesson/grade` body `{prompt, answer, skill, category}` → corrige (reglas locales MVP + LLM opcional), guarda `attempt`, actualiza `vocab`, devuelve `{correct, corrections[], nextDifficulty}`.
  - `GET /api/progress` → agregados para dashboard.
- **DB (SQLite local + Drizzle ORM, pivote coste cero 2026-09-26 — sustituye Vercel Postgres):**
  - `profile(id=1, level TEXT, streak INT, last_study DATE)`
  - `attempts(id INTEGER PK, skill TEXT, category TEXT, prompt TEXT, answer TEXT, correct INT, created_at TEXT)`
  - `vocab(word PK, seen INT, mastered INT, next_review DATE)`
  - `sessions(id INTEGER PK, started TEXT, duration_sec INT)`
  - Drizzle sqlite: `src/db/schema.ts`, `drizzle.config.ts`, `data/teacher.db` (gitignored, coste cero).
  - **Limitación:** SQLite en fichero NO persiste en Vercel serverless (FS efímero). DoD prod requerirá Turso/Neon free (cero coste) en fase posterior. MVP local sí persiste tras recarga.
- **Adaptación v1 (simple, verificable):**
  - `peso_cat = error_rate_cat*2 + (1-mastery_skill)`. Elige max peso.
  - Si `>=3 aciertos seguidos` en skill → `dificultad+1` (B1→B1+→B2).
  - Si fallo en categoría top-2 → próxima lección repasa esa categoría, `next_review = hoy + 2^fallos días`.
  - Sin ML. Lógica pura en `lib/adapt.ts`, testeable con vitest.

## 4. Skills.sh propuestos (NO instalar sin aprobación)
| Skill | Para qué | Riesgo/permisos |
|---|---|---|
| `vercel-labs/agent-skills:vercel-react-best-practices` | Patrones Next.js/React server-first | Solo lectura docs, bajo |
| `anthropics/skills:frontend-design` | UI lección/progreso limpia | Solo plantillas, bajo |
| `shadcn/ui:shadcn` | Componentes accesibles rápidos | Añade deps UI, medio-bajo |
| `mattpocock/skills:teach` | Estructura lección (entrevista→lección→quiz) | Metodología, bajo |
| `openclaw/skills:language-learning` | Lógica tutor: conversación, drills, corrección inline | Prompt-heavy, bajo |
| `obra/superpowers:test-driven-development` + `systematic-debugging` | Tests adaptación y grade | Solo flujo trabajo, bajo |
| `prisma/skills:prisma-postgres` (alt.) o `supabase/agent-skills:supabase-postgres-best-practices` | Referencia SQL si Drizzle bloquea | Solo docs, bajo |

Instalación propuesta solo tras OK: `npx skills add <owner/repo> --skill <nombre> -a opencode` (project-local, no `-g`).

## 5. MCP propuestos (NO instalar/usar sin aprobación)
| MCP | Para qué | Riesgo/permisos |
|---|---|---|
| Vercel MCP / Postgres MCP | Provisionar DB, `env pull`, logs deploy | Toca infra/env, ALTO → confirmar |
| GitHub MCP | Crear PRs, ver checks | Repo scope, medio |
| Playwright MCP | Verificación UI `/lesson` headless | Solo local browser, bajo |

## 6. Riesgos / Decisiones pendientes
- No hay proyecto Vercel: habrá que `vercel link` + crear proyecto + Postgres. Requiere confirmación explícita (infra).
- LLM para corrección: MVP usa banco local + reglas para no bloquearse por `OPENAI_API_KEY`. Añadir LLM es fase 2 con secreto (requiere confirmación).
- Audio diferido acordado, no entra en MVP.

## 7. Puerta a Fase 3
No crear `TASKS.md` ni scaffold hasta aprobación explícita de este PLAN + skills/MCP a instalar.
