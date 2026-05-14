# Recurs

Aplikacja do planowania nauki i powtórek z wykorzystaniem algorytmu spaced repetition (FSRS). Umożliwia zarządzanie przedmiotami, egzaminami, tematami, fiszkami oraz automatyczne generowanie notatek z pomocą AI.

## 🌐 Wersja produkcyjna

| | URL |
|--|-----|
| **Aplikacja** | https://recurs.app |
| **API** | https://zlota-apka.rayserrek.workers.dev|
| **Dokumentacja API (Scalar)** | https://zlota-apka.rayserrek.workers.dev/api/reference |

> Konto demo dostępne z poziomu landing page – nie wymaga rejestracji.

---

## Architektura

Monorepo z dwoma pakietami:

```
├── frontend/   → React 19 SPA, Cloudflare Pages
├── backend/    → Hono API, Cloudflare Workers
└── package.json (root – husky, pnpm workspace)
```

| Warstwa | Technologia | Hosting |
|---------|-------------|---------|
| Frontend | React 19, TanStack Router, TailwindCSS 4, Vite 8, PWA | Cloudflare Pages |
| Backend | Hono (OpenAPI), Drizzle ORM, better-auth | Cloudflare Workers |
| Baza danych | PostgreSQL (Neon Serverless) | Neon |
| AI | Google Gemini API | — |
| Email | Cloudflare Email Service (Send Email binding) | Cloudflare |
| CI/CD | GitHub Actions | — |

## Stos technologiczny

**Frontend:**
- React 19 z React Compiler (babel plugin)
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- TailwindCSS 4 + class-variance-authority
- ECharts (wykresy/statystyki)
- i18next (PL/EN)
- vite-plugin-pwa (offline support)
- Vite 8

**Backend:**
- Hono z @hono/zod-openapi
- Drizzle ORM + drizzle-kit (migracje)
- @neondatabase/serverless (PostgreSQL driver)
- better-auth (autentykacja magic link)
- @google/generative-ai (Gemini)
- Scalar (dokumentacja API)
- Zod 4 (walidacja)
- Vite 8 + @cloudflare/vite-plugin

**Tooling:**
- pnpm 10.33
- Node.js 24.x
- oxlint + oxfmt (linting/formatting)
- Husky + lint-staged (pre-commit hooks)
- Vitest (testy)

## Wymagania

- Node.js >= 24.x
- pnpm >= 10.x
- Konto Cloudflare (deploy)
- Baza danych Neon PostgreSQL (lub dowolna PostgreSQL)
- Klucz API Google Gemini (opcjonalnie, do generowania notatek)

## Środowisko developerskie

### 1. Klonowanie i instalacja

```bash
git clone <repo-url>
cd zlota-apka

# Instalacja husky (root)
pnpm install

# Frontend
cd frontend
pnpm install

# Backend
cd backend
pnpm install
```

### 2. Konfiguracja zmiennych środowiskowych

**Backend** – utwórz plik `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
BETTER_AUTH_SECRET=losowy-sekret-min-32-znaki
BETTER_AUTH_URL=http://localhost:8787
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=twoj-klucz-gemini
RESEND_API_KEY=twoj-klucz-resend
```

**Frontend** – utwórz plik `frontend/.env.local` (opcjonalnie, jeśli potrzebujesz nadpisać domyślne wartości):

```env
VITE_API_URL=http://localhost:8787
```

### 3. Konfiguracja bazy danych

```bash
cd backend

# Wygeneruj migracje (jeśli zmieniłeś schemat)
pnpm db:generate

# Zastosuj schemat do bazy
pnpm db:push

# Opcjonalnie: otwórz Drizzle Studio
pnpm db:studio
```

### 4. Uruchomienie

```bash
# Backend (port 8787)
cd backend
pnpm dev

# Frontend (port 5173, proxy /api → localhost:8787)
cd frontend
pnpm dev
```

Frontend automatycznie proxy'uje requesty `/api/*` do backendu na porcie 8787.

### 5. Przydatne komendy dev

```bash
# Linting
pnpm lint          # w frontend/ lub backend/
pnpm lint:fix      # autofix

# Formatowanie
pnpm fmt           # formatuj
pnpm fmt:check     # sprawdź

# Testy
pnpm test          # w frontend/ lub backend/

# Type check
pnpm exec tsc -b
```

## Środowisko produkcyjne (deploy)

Aplikacja jest hostowana na Cloudflare:
- **Frontend** → Cloudflare Pages (projekt: `recurs-app`)
- **Backend** → Cloudflare Workers (worker: `recurs-app`)

### Wymagania do deployu

1. Zainstalowany `wrangler` (jest w devDependencies obu pakietów)
2. Zalogowanie do Cloudflare: `wrangler login`
3. Skonfigurowane secrety w Cloudflare Dashboard lub przez CLI

### Konfiguracja secretów (Cloudflare Workers – backend)

Secrety ustawiane przez Cloudflare Dashboard lub CLI:

```bash
cd backend

# Wymagane secrety
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put RESEND_API_KEY
wrangler secret put FRONTEND_URL
wrangler secret put GEMINI_API_KEY
```

Zmienne zdefiniowane w `wrangler.jsonc` (nie wymagają ręcznego ustawiania):
- `DEMO_GUEST_ID` = `"demo-guest"`
- `EMAIL_FROM` = `"Recurs <hello@recurs.app>"`
- `FRONTEND_URL` (nadpisywany przez secret jeśli potrzeba)

### Deploy backendu

```bash
cd backend
pnpm run deploy
```

To wykonuje `vite build` + `wrangler deploy -c wrangler.jsonc`. Worker jest deployowany z:
- Compatibility date: `2026-04-20`
- Compatibility flags: `nodejs_compat`
- Cron trigger: `0 7 * * *` (codziennie o 7:00 UTC – generowanie powiadomień)
- Send Email binding (Cloudflare Email)

### Deploy frontendu

```bash
cd frontend
pnpm run deploy
```

To wykonuje `tsc -b` + `vite build` + `wrangler pages deploy ./dist --project-name=recurs-app`.

### Konfiguracja DNS / Custom domain

- Frontend: `recurs.app` → Cloudflare Pages custom domain

### Konfiguracja Cloudflare Email (Send Email)

Backend korzysta z Cloudflare Email Service do wysyłania maili (magic link auth). Binding `SEND_EMAIL` jest zdefiniowany w `backend/wrangler.jsonc`. Wymaga:
1. Zweryfikowanej domeny w Cloudflare Email Routing
2. Skonfigurowanego adresu nadawcy (`hello@recurs.app`)

### CI/CD (GitHub Actions)

Pipeline `.github/workflows/ci.yml` uruchamia się na każdym push i PR do `main`:

**Frontend:**
1. Format check (`pnpm fmt:check`)
2. Lint (`pnpm lint`)
3. Type check (`tsc -b`)
4. Build (`pnpm build`)

**Backend:**
1. Format check (`pnpm fmt:check`)
2. Lint (`pnpm lint`)
3. Type check (`tsc -b`)
4. Testy (`pnpm test`)

## Struktura bazy danych

Główne tabele (Drizzle ORM, PostgreSQL):

| Tabela | Opis |
|--------|------|
| `user` | Użytkownicy (klasa, onboarding, ustawienia) |
| `session` | Sesje autentykacji |
| `account` | Konta OAuth/email |
| `verification` | Tokeny weryfikacji email |
| `subjects` | Przedmioty (mat, bio, hist, pol, chem, fiz, ang, other) |
| `exams` | Egzaminy z datą, trudnością, rozmiarem materiału |
| `topics` | Tematy przypisane do przedmiotów/egzaminów |
| `notes` | Notatki (manualne lub AI) |
| `generated_notes` | Notatki wygenerowane przez AI |
| `cards` | Fiszki z parametrami FSRS (stability, difficulty, due) |
| `user_availability` | Dostępność użytkownika (dzień tygodnia, minuty) |
| `study_sessions` | Zaplanowane sesje nauki |
| `review_history` | Historia powtórek fiszek |
| `notifications` | Powiadomienia (exam, session, review, ai, system) |
| `scheduler_runs` | Logi uruchomień schedulera |

## API

Dokumentacja API dostępna pod:
- OpenAPI JSON: `GET /api/doc`
- Scalar UI: `GET /api/reference`

Produkcja: https://zlota-apka.rayserrek.workers.dev/api/reference

## Licencja

MIT © 2026 Rayzerrek
