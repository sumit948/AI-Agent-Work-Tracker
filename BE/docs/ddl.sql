-- ============================================================
-- AI-Powered Work Tracker — PostgreSQL DDL
-- Database: worktracker (or Supabase postgres)
-- Version: 1.0.0
-- ============================================================

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    email       VARCHAR(150)   NOT NULL,
    password    VARCHAR(255)   NOT NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- RAW LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS raw_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT         NOT NULL,
    raw_text    TEXT           NOT NULL,
    ai_status   VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                               CHECK (ai_status IN ('PENDING', 'PROCESSED', 'FAILED')),
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_raw_logs_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- STRUCTURED LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS structured_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT          NOT NULL,
    raw_log_id   BIGINT          NOT NULL,
    task_title   VARCHAR(255)    NOT NULL,
    category     VARCHAR(50)     NOT NULL
                                 CHECK (category IN ('BUG', 'FEATURE', 'MEETING', 'REVIEW', 'DOCUMENTATION', 'OTHER')),
    hours        DECIMAL(4,1),
    log_date     DATE,
    CONSTRAINT fk_structured_logs_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_structured_logs_raw_log FOREIGN KEY (raw_log_id) REFERENCES raw_logs(id) ON DELETE CASCADE
);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    report_type   VARCHAR(20)  NOT NULL
                               CHECK (report_type IN ('DAILY', 'WEEKLY')),
    content       TEXT,
    period_start  DATE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reports_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_reports_user_type_period UNIQUE (user_id, report_type, period_start)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- raw_logs
CREATE INDEX IF NOT EXISTS idx_raw_logs_user_id
    ON raw_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_logs_ai_status
    ON raw_logs(ai_status);
CREATE INDEX IF NOT EXISTS idx_raw_logs_created_at
    ON raw_logs(created_at DESC);

-- structured_logs
CREATE INDEX IF NOT EXISTS idx_structured_logs_user_id
    ON structured_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_structured_logs_log_date
    ON structured_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_structured_logs_category
    ON structured_logs(category);
CREATE INDEX IF NOT EXISTS idx_structured_logs_user_date
    ON structured_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_structured_logs_raw_log_id
    ON structured_logs(raw_log_id);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id
    ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_period_start
    ON reports(period_start);

-- ============================================================
-- SAMPLE SEED DATA (DEV/TEST ONLY — DO NOT USE IN PRODUCTION)
-- ============================================================

-- Insert a test user (password = "password123" BCrypt hashed)
-- INSERT INTO users (name, email, password) VALUES
--     ('Demo User', 'demo@worktracker.ai', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO');

-- ============================================================
-- CLEANUP (for re-running in dev)
-- ============================================================
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS structured_logs CASCADE;
-- DROP TABLE IF EXISTS raw_logs CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
