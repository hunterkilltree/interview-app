# software-engineer-life — Interview Prep App

Full-stack port of the InterviewPrepApp design.

- **Frontend** — Next.js 15 (App Router), UI matching the design 1:1, deploys on Vercel
- **Backend** — Spring Boot 4 (Java 21) REST API in `backend/`, JWT auth, deploys on Render
- **Database** — PostgreSQL (free tier on Supabase or Neon), managed by Flyway

The backend follows the conventions from
[rrezartprebreza/spring-boot-skills](https://github.com/rrezartprebreza/spring-boot-skills)
(`skills/spring-boot-4`): layered architecture, `ApiResponse` envelope, Security 7 lambda DSL,
UUID ids, Flyway migrations, constructor injection.

## Architecture

```
Browser ──> Next.js (Vercel)  ── server-side fetch + JWT ──> Spring Boot API (Render) ──> Postgres
             httpOnly cookies                                  /api/v1/**
```

Tokens (15-min access + 7-day refresh) are issued by the API and stored as httpOnly cookies
by the Next.js server; the middleware auto-refreshes expired access tokens.

## API surface

```
POST   /api/v1/auth/register | login | refresh
GET    /api/v1/me
GET    /api/v1/questions                    (paginated envelope)
GET    /api/v1/docs[?section=]   /docs/{id}
GET    /api/v1/question-state               (per-user)
PUT    /api/v1/question-state/{questionId}  {confidence?, notes?}
POST   /api/v1/ai/coach                     {questionId, confidence?, notes?}
POST/PUT/DELETE /api/v1/admin/questions[/{id}]   (ROLE_ADMIN)
POST/PUT/DELETE /api/v1/admin/docs[/{id}]        (ROLE_ADMIN)
GET    /actuator/health
```

All responses use the `{success, data, error, timestamp}` envelope.

## 1. Database (free)

Create a free Postgres database (Supabase → Project Settings → Database, or https://neon.tech).
No schema setup needed — Flyway runs `backend/src/main/resources/db/migration/` on startup
(tables + seed content from the design).

## 2. Run the backend locally

Requires Java 21 + Maven 3.9+ (or Docker).

```bash
cd backend
export DATABASE_URL=jdbc:postgresql://localhost:5432/interviewprep
export DATABASE_USER=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=$(openssl rand -base64 48)
export ADMIN_EMAIL=you@example.com        # promoted to admin on next boot after signup
export ANTHROPIC_API_KEY=sk-ant-...       # optional, enables AI coach
mvn spring-boot:run
```

Or with Docker: `docker build -t interview-prep-api . && docker run -p 8080:8080 --env-file .env interview-prep-api`

## 3. Run the frontend locally

```bash
cp .env.example .env.local    # API_URL=http://localhost:8080
npm install
npm run dev
```

Open http://localhost:3000, create an account. To become admin: set `ADMIN_EMAIL` to your
signup email and restart the backend (promotion runs at boot).

## 4. Deploy (all free tiers)

**Backend → Render**
1. Push to GitHub. In Render: New → Web Service → pick the repo, set **Root Directory** = `backend`,
   Runtime = Docker (uses `backend/Dockerfile`).
2. Env vars: `DATABASE_URL` (jdbc URL), `DATABASE_USER`, `DATABASE_PASSWORD`, `JWT_SECRET`,
   `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`, `ADMIN_EMAIL`, `ANTHROPIC_API_KEY` (optional).
3. Health check path: `/actuator/health`.
   Note: Render free sleeps after ~15 min idle; first request after that takes ~50 s.

**Frontend → Vercel**
1. New → Project → import the repo (Next.js auto-detected, root directory = repo root).
2. Env var: `API_URL=https://your-api.onrender.com`.

**Database → Supabase or Neon** free Postgres; put its JDBC credentials in Render.

## Project layout

```
app/                      Next.js frontend (screens from the design)
components/               shared UI
lib/api.ts                Spring API client (envelope + JWT cookies)
lib/data.ts               typed data access via the API
middleware.ts             auth guard + token refresh
backend/
  src/main/java/life/swengineer/interviewprep/
    auth/                 JWT service, filter, auth endpoints
    user/                 User entity, /me, current-user resolution
    content/              questions, docs, per-user state (+ admin CRUD)
    ai/                   AI coach (Anthropic API via RestClient)
    common/               ApiResponse envelope, global exception handler
    config/               SecurityConfig, admin bootstrap
  src/main/resources/db/migration/   Flyway V1..V3 (schema + seed)
  Dockerfile
```

## Verify

- Frontend: `npm run build`
- Backend: `cd backend && mvn verify` (needs network access to Maven Central)
