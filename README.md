# AI-Agent-Work-Tracker

Searched for files matching `**/README*`, no matches

Read [](file:///d%3A/Agent-WT/BE/Work%20Tracker%20Service/src/main/resources/application.yaml)

Read [](file:///d%3A/Agent-WT/BE/Work%20Tracker%20Service/build.gradle#1-1), lines 1 to 50

Read [](file:///d%3A/Agent-WT/FE/WT-UI/package.json#1-1), lines 1 to 30

Searched for regex `class.*Service|class.*Controller|class.*Repository` (`Agent-WT` · `BE/Work Tracker Service/src/main/java/**/*.java`), 13 results

Read [](file:///d%3A/Agent-WT/FE/WT-UI/lib/work-tracker-types.ts#1-1), lines 1 to 30

Now I have everything I need. Here is the complete README content:

---

```markdown
# AI-Powered Work Tracker

A full-stack AI work logging application where you write raw notes about your day and AI structures them into categorised, time-estimated tasks. Includes analytics dashboards, AI-generated reports, and a conversational assistant to query your work history.

**Live Demo →** *(add your Vercel URL here)*  
**GitHub →** https://github.com/sumit948/AI-Agent-Work-Tracker

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5 · Java 21 · Spring Security · Spring Data JPA |
| AI Integration | OpenAI GPT-3.5-turbo via WebClient (reactive) |
| Auth | JWT (jjwt 0.12.3) — stateless, Bearer token |
| Database | PostgreSQL (hosted on Supabase) |
| API Docs | SpringDoc OpenAPI / Swagger UI |
| Frontend | Next.js 16.2 · React 19 · TypeScript 5.7 |
| Styling | Tailwind CSS v4 · Radix UI · shadcn/ui |
| Charts | Recharts |

---

## Project Structure

```
AI-Agent-Work-Tracker/
├── BE/
│   └── Work Tracker Service/       ← Spring Boot application
│       ├── build.gradle
│       ├── gradlew / gradlew.bat
│       └── src/
│           ├── main/
│           │   ├── java/com/ai/wt/
│           │   │   ├── controller/     → REST endpoints (Auth, Log, Analytics, Report, Chat, AI)
│           │   │   ├── service/        → Business logic (Auth, Log, Analytics, Report, Chat, AI)
│           │   │   ├── repository/     → JPA repositories
│           │   │   ├── entity/         → JPA entities (User, RawLog, StructuredLog, Report)
│           │   │   ├── dto/            → Request/Response DTOs
│           │   │   ├── security/       → JWT filter, UserDetailsService, SecurityConfig
│           │   │   └── config/         → WebClient config, CORS, OpenAPI config
│           │   └── resources/
│           │       ├── application.yaml          ← safe to commit (no secrets)
│           │       └── application-local.yaml    ← ⚠️ gitignored — you create this locally
│           └── test/
│               └── resources/
│                   └── application.yaml          ← H2 in-memory for tests
├── FE/
│   └── WT-UI/                      ← Next.js application
│       ├── app/
│       │   ├── login/              → Login page with "View Demo" button
│       │   ├── register/           → Registration page
│       │   └── work-tracker/
│       │       ├── layout.tsx      → Protected layout with Demo Mode banner
│       │       ├── page.tsx        → Dashboard
│       │       ├── entry/          → Log Work (AI text entry)
│       │       ├── chat/           → AI Chat Assistant
│       │       ├── analytics/      → Analytics charts
│       │       └── reports/        → Daily / Weekly reports
│       ├── components/             → UI components (sidebar, task card, stat card, shadcn/ui)
│       ├── lib/
│       │   ├── api-client.ts       → Axios wrapper with JWT header injection
│       │   ├── api/                → Per-feature API modules (auth, logs, analytics, reports, chat)
│       │   ├── auth-context.tsx    → AuthProvider, useAuth() hook, demo mode
│       │   └── work-tracker-types.ts → Shared TypeScript types + demo mock data
│       └── .env.local              ← ⚠️ gitignored — you create this locally
└── BE/docs/
    └── ddl.sql                     ← Full PostgreSQL schema
```

---

## Database Schema

4 tables — see [BE/docs/ddl.sql](BE/docs/ddl.sql) for the full DDL.

| Table | Purpose |
|-------|---------|
| `users` | Registered users with BCrypt-hashed passwords |
| `raw_logs` | Raw text submitted by user; AI status tracked (`PENDING / PROCESSED / FAILED`) |
| `structured_logs` | AI-extracted tasks linked to a raw log (title, category, hours, date) |
| `reports` | Cached daily/weekly AI-generated report text |

Categories: `BUG · FEATURE · MEETING · REVIEW · DOCUMENTATION · OTHER`

---

## REST API

Base URL: `http://localhost:8080/api`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT |
| POST | `/logs` | Yes | Submit raw text → AI structures it |
| GET | `/logs` | Yes | Get all logs for the current user |
| GET | `/logs/{id}` | Yes | Get a single log with structured tasks |
| GET | `/analytics/summary?startDate=&endDate=` | Yes | Aggregated stats + daily trend + category breakdown |
| GET | `/reports/daily?date=` | Yes | AI-generated daily report |
| GET | `/reports/weekly?weekStart=` | Yes | AI-generated weekly report |
| POST | `/chat/ask` | Yes | Ask the AI about your work history |

All protected endpoints require: `Authorization: Bearer <token>`

---

## Local Setup

### Prerequisites
- Java 21+
- Node.js 18+ and pnpm (or npm)
- A PostgreSQL database (Supabase free tier works)
- An OpenAI API key (optional — see note below)

---

### Backend

#### 1. Create `application-local.yaml`

This file is **gitignored** and must be created manually. It holds all secrets.

Create this file at:
```
BE/Work Tracker Service/src/main/resources/application-local.yaml
```

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<your-db-host>:5432/postgres?sslmode=require
    username: <your-db-username>
    password: <your-db-password>

application:
  jwt:
    secret: <any-random-string-at-least-32-characters-long>
  ai:
    openai:
      api-key: sk-<your-openai-api-key>    # See note below about AI key
```

> **No OpenAI key?** The app still works. Submitted logs will return `aiStatus: "FAILED"` and no structured tasks will be extracted. All other features (auth, analytics, reports, chat) that do not require AI will work normally. For portfolio demo purposes, use the built-in Demo Mode instead.

#### 2. Run the database migrations

Run the DDL manually against your PostgreSQL database:
```
BE/docs/ddl.sql
```

If using Supabase: open the SQL editor and paste the contents of `ddl.sql`.

#### 3. Start the backend

```bash
cd "BE/Work Tracker Service"

# Windows
.\gradlew.bat bootRun --args='--spring.profiles.active=local'

# macOS / Linux
./gradlew bootRun --args='--spring.profiles.active=local'
```

The server starts at **http://localhost:8080**

Alternatively, set environment variables and run without the local profile:

```bash
export DB_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
export DB_USERNAME=<username>
export DB_PASSWORD=<password>
export JWT_SECRET=<secret>
export OPENAI_API_KEY=sk-<key>

./gradlew bootRun
```

#### 4. Run tests

Tests use an H2 in-memory database and do not require any live credentials:

```bash
.\gradlew.bat test       # Windows
./gradlew test           # macOS / Linux
```

---

### Frontend

#### 1. Create `.env.local`

Create this file at .env.local:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### 2. Install dependencies and run

```bash
cd FE/WT-UI
npm install          # or: pnpm install
npm run dev          # starts at http://localhost:3000
```

---

## Demo Mode (No Backend Required)

The app includes a built-in **Demo Mode** for portfolio viewing — no account or running backend is needed.

On the login page, click **"View Live Demo"** to enter the app with realistic sample data:

- Dashboard with weekly charts and today's tasks
- Work Entry that simulates AI processing
- AI Chat that answers questions about the mock work history
- Analytics with category breakdowns and trend charts
- Daily and weekly AI reports with full summaries

A purple **Demo Mode** banner appears at the top with options to create a real account or exit demo.

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) — set Root Directory to WT-UI; add `NEXT_PUBLIC_API_URL` env var |
| Backend | [Railway](https://railway.app) — set the 5 env vars (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `OPENAI_API_KEY`) |
| Database | [Supabase](https://supabase.com) — free PostgreSQL, run `ddl.sql` in the SQL editor |

---

## Known Limitations

- **AI features require an OpenAI API key.** Without one, log submission still saves the raw text but `aiStatus` will be `FAILED` and tasks will not be extracted.
- **Database schema is managed manually.** Run `ddl.sql` when setting up. Hibernate is set to `validate` so it checks but does not create/alter tables.
- **JWT tokens are not blacklisted on logout.** Logout clears the token client-side; the token remains valid server-side until expiry (`24h` default).
- **Reports are cached per period.** If you add more logs to a day after generating a report, re-request the report to regenerate it.

---

## Security Notes

- All secrets (DB credentials, JWT secret, OpenAI key) are kept outside the codebase via `application-local.yaml` and `.env.local`, both of which are gitignored.
- Passwords are hashed with BCrypt before storage.
- All API endpoints (except `/auth/register` and `/auth/login`) require a valid JWT.
- CORS is restricted to `http://localhost:3000` by default; configure `CORS_ORIGINS` for production.
```
