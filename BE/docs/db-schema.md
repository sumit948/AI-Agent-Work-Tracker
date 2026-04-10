# Database Schema — AI-Powered Work Tracker

Database: **PostgreSQL** (Supabase managed / local for dev)  
ORM: Spring Data JPA (Hibernate DDL auto-update)

---

## Tables Overview

| Table | Description |
|-------|-------------|
| `users` | Registered user accounts |
| `raw_logs` | Raw work notes submitted by users |
| `structured_logs` | AI-extracted structured tasks from raw logs |
| `reports` | AI-generated daily/weekly reports (cached) |

---

## Table: `users`

Stores registered user accounts. Passwords are always BCrypt-hashed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto-increment primary key |
| `name` | `VARCHAR(100)` | NOT NULL | User's full display name |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | Login email address |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt-hashed password (never plaintext) |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_users_email ON users(email)`

---

## Table: `raw_logs`

Stores the original unstructured work text submitted by the user. Never modified after creation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto-increment primary key |
| `user_id` | `BIGINT` | NOT NULL, FK → users.id | Owning user |
| `raw_text` | `TEXT` | NOT NULL | Original user input text |
| `ai_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'PENDING' | Processing state: PENDING / PROCESSED / FAILED |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Submission timestamp |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX idx_raw_logs_user_id ON raw_logs(user_id)`
- `INDEX idx_raw_logs_ai_status ON raw_logs(ai_status)` (for retry queries)

---

## Table: `structured_logs`

AI-extracted tasks derived from raw log entries. Each raw log can produce multiple structured tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto-increment primary key |
| `user_id` | `BIGINT` | NOT NULL, FK → users.id | Owning user (denormalized for faster queries) |
| `raw_log_id` | `BIGINT` | NOT NULL, FK → raw_logs.id | Source raw log |
| `task_title` | `VARCHAR(255)` | NOT NULL | AI-extracted task name |
| `category` | `VARCHAR(50)` | NOT NULL | Enum: BUG / FEATURE / MEETING / REVIEW / DOCUMENTATION / OTHER |
| `hours` | `DECIMAL(4,1)` | | AI-estimated effort in hours (e.g. 2.5) |
| `log_date` | `DATE` | | Date of work (derived from raw_log.created_at) |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE
- `raw_log_id` → `raw_logs.id` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX idx_structured_logs_user_id ON structured_logs(user_id)`
- `INDEX idx_structured_logs_log_date ON structured_logs(log_date)` (for date-range queries)
- `INDEX idx_structured_logs_category ON structured_logs(category)` (for analytics grouping)
- `INDEX idx_structured_logs_user_date ON structured_logs(user_id, log_date)` (composite for reports)

---

## Table: `reports`

Cached AI-generated reports. Avoids re-generating the same report multiple times.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto-increment primary key |
| `user_id` | `BIGINT` | NOT NULL, FK → users.id | Owning user |
| `report_type` | `VARCHAR(20)` | NOT NULL | Enum: DAILY / WEEKLY |
| `content` | `TEXT` | | AI-generated report text (plain text) |
| `period_start` | `DATE` | | Start date of the report period |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Report generation timestamp |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX idx_reports_user_id ON reports(user_id)`
- `INDEX idx_reports_period_start ON reports(period_start)`
- `UNIQUE INDEX idx_reports_unique ON reports(user_id, report_type, period_start)` (prevent duplicate reports)

---

## Entity Relationships (ERD Summary)

```
users (1) ──────< raw_logs (many)
users (1) ──────< structured_logs (many)
users (1) ──────< reports (many)
raw_logs (1) ───< structured_logs (many)
```

---

## Enum Values Reference

### `raw_logs.ai_status`
| Value | Description |
|-------|-------------|
| `PENDING` | Raw log saved, awaiting AI processing |
| `PROCESSED` | AI successfully extracted structured tasks |
| `FAILED` | AI processing failed (retry possible via /api/ai/process-log) |

### `structured_logs.category`
| Value | Description |
|-------|-------------|
| `BUG` | Bug fix or debugging work |
| `FEATURE` | New feature development |
| `MEETING` | Meetings, standups, planning sessions |
| `REVIEW` | Code review, PR reviews |
| `DOCUMENTATION` | Writing docs, README, API specs |
| `OTHER` | Anything not fitting above categories |

### `reports.report_type`
| Value | Description |
|-------|-------------|
| `DAILY` | Daily standup / EOD report |
| `WEEKLY` | Weekly summary report |

---

## Notes

1. **Password security**: `users.password` stores only BCrypt hash. Raw password is NEVER stored or logged.
2. **User isolation**: Every query filters by `user_id` derived from the authenticated JWT — no cross-user data access possible.
3. **Soft delete**: Not implemented in v1. User and log deletion cascade removes all related data.
4. **AI key security**: OpenAI API key is stored in environment variables only — never in DB or source code.
5. **Audit trail**: `raw_logs` preserves original user input permanently, even after structured processing. This allows re-processing with improved AI models.
