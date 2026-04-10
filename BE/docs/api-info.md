# AI-Powered Work Tracker — API Reference

Base URL: `http://localhost:8080/api`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
OpenAPI Docs: `http://localhost:8080/api-docs`

---

## Authentication

All protected endpoints require a `Bearer` JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

---

## 1. Auth APIs (`/api/auth`)

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response `201 Created`:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOi...",
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "expiresIn": 86400000
  }
}
```

**Errors:**
- `409 Conflict` — Email already registered
- `400 Bad Request` — Validation failure (missing/invalid fields)

---

### POST `/api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "expiresIn": 86400000
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid credentials
- `400 Bad Request` — Validation failure

---

## 2. Work Log APIs (`/api/logs`)

### POST `/api/logs`
Submit raw work notes — triggers AI processing pipeline.

**Request Body:**
```json
{
  "rawText": "Fixed login bug, worked on payment API, attended sprint planning"
}
```

**Response `201 Created`:**
```json
{
  "status": "success",
  "message": "Work log submitted and processed",
  "data": {
    "rawLogId": 5,
    "aiStatus": "PROCESSED",
    "structuredTasks": [
      {
        "id": 10,
        "taskTitle": "Fix login bug",
        "category": "BUG",
        "hours": 2.0,
        "logDate": "2026-04-10"
      },
      {
        "id": 11,
        "taskTitle": "Payment API development",
        "category": "FEATURE",
        "hours": 3.0,
        "logDate": "2026-04-10"
      },
      {
        "id": 12,
        "taskTitle": "Sprint planning meeting",
        "category": "MEETING",
        "hours": 1.0,
        "logDate": "2026-04-10"
      }
    ]
  }
}
```

**Errors:**
- `400 Bad Request` — Empty rawText
- `401 Unauthorized` — Missing/invalid JWT
- `500 Internal Server Error` — AI processing failure (raw log saved with FAILED status)

---

### GET `/api/logs`
Retrieve all raw work logs for the authenticated user.

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "rawLogId": 5,
      "rawText": "Fixed login bug, worked on payment API...",
      "aiStatus": "PROCESSED",
      "createdAt": "2026-04-10T09:30:00",
      "structuredTasks": [...]
    }
  ]
}
```

---

### GET `/api/logs/{id}`
Retrieve a single raw log entry with structured tasks.

**Path Param:** `id` — raw log ID

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "rawLogId": 5,
    "rawText": "Fixed login bug...",
    "aiStatus": "PROCESSED",
    "createdAt": "2026-04-10T09:30:00",
    "structuredTasks": [...]
  }
}
```

**Errors:**
- `404 Not Found` — Log not found or not owned by user

---

## 3. AI Processing API (`/api/ai`)

### POST `/api/ai/process-log`
Manually trigger AI re-processing on a previously saved raw log (admin/retry use).

**Request Body:**
```json
{
  "rawLogId": 5
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Log re-processed successfully",
  "data": {
    "rawLogId": 5,
    "aiStatus": "PROCESSED",
    "structuredTasks": [...]
  }
}
```

**Errors:**
- `404 Not Found` — Raw log not found
- `500 Internal Server Error` — AI processing failed

---

## 4. Reports API (`/api/reports`)

### GET `/api/reports/daily?date={date}`
Get AI-generated daily report with task breakdown.

**Query Param:** `date` — format `yyyy-MM-dd` (defaults to today)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "date": "2026-04-10",
    "totalHours": 6.5,
    "taskCount": 3,
    "tasks": [...],
    "summary": "Today you fixed 1 bug (2h), developed 1 feature (3h), and attended 1 meeting (1h)...",
    "categoryBreakdown": {
      "BUG": 2.0,
      "FEATURE": 3.0,
      "MEETING": 1.0
    }
  }
}
```

---

### GET `/api/reports/weekly?weekStart={date}`
Get AI-generated weekly report.

**Query Param:** `weekStart` — format `yyyy-MM-dd` — Monday of the target week (defaults to current week)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "weekStart": "2026-04-07",
    "weekEnd": "2026-04-13",
    "totalHours": 33.5,
    "taskCount": 15,
    "categoryBreakdown": {
      "FEATURE": 15.0,
      "BUG": 8.5,
      "MEETING": 5.0,
      "REVIEW": 3.5,
      "DOCUMENTATION": 1.5
    },
    "dailyBreakdown": [...],
    "summary": "Strong week with consistent productivity..."
  }
}
```

---

## 5. Analytics API (`/api/analytics`)

### GET `/api/analytics?startDate={date}&endDate={date}`
Get comprehensive productivity analytics.

**Query Params:** `startDate`, `endDate` — format `yyyy-MM-dd` (defaults to last 7 days)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "totalHours": 33.5,
    "totalTasks": 15,
    "avgHoursPerDay": 6.7,
    "productivityScore": 83.75,
    "categoryBreakdown": [
      { "category": "FEATURE", "taskCount": 7, "totalHours": 15.0 },
      { "category": "BUG", "taskCount": 4, "totalHours": 8.5 }
    ],
    "dailyTrend": [
      { "date": "2026-04-07", "hours": 6.0, "taskCount": 3 },
      { "date": "2026-04-08", "hours": 7.5, "taskCount": 4 }
    ]
  }
}
```

---

## 6. Chat API (`/api/chat`)

### POST `/api/chat`
Ask a natural language question about your work history.

**Request Body:**
```json
{
  "question": "What did I work on last week?"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "question": "What did I work on last week?",
    "answer": "Last week you completed 15 tasks across 33.5 hours. You focused on feature development (45%), bug fixes (25%), and meetings (15%). Your most productive day was Thursday with 8 hours logged.",
    "timestamp": "2026-04-10T14:30:00"
  }
}
```

**Errors:**
- `400 Bad Request` — Empty question
- `500 Internal Server Error` — AI service failure

---

## Error Response Format

All errors follow this standard format:

```json
{
  "code": "DUPLICATE_EMAIL",
  "message": "Email already registered: john@example.com",
  "timestamp": "2026-04-10T14:30:00"
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|------------|-------------|
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AI_PROCESSING_ERROR` | 500 | LLM API processing failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
