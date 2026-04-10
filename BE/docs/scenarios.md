# Test Scenarios — AI-Powered Work Tracker

Covers positive (happy path) and negative (error/edge) scenarios for all API endpoints.

---

## 1. Auth — Register (`POST /api/auth/register`)

### Positive Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| P1 | Valid name, unique email, strong password | `201 Created`, JWT token returned, user saved in DB |
| P2 | Name with spaces/special characters (e.g. "John O'Brien") | `201 Created`, name stored as-is |
| P3 | Email with subdomain (e.g. "user@mail.company.com") | `201 Created` |

### Negative Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| N1 | Email already registered | `409 Conflict`, code `DUPLICATE_EMAIL` |
| N2 | Missing `name` field | `400 Bad Request`, code `VALIDATION_ERROR` |
| N3 | Missing `email` field | `400 Bad Request` |
| N4 | Invalid email format (e.g. "notanemail") | `400 Bad Request` |
| N5 | Password shorter than 8 characters | `400 Bad Request` |
| N6 | Empty request body | `400 Bad Request` |
| N7 | SQL injection in name field (e.g. `'; DROP TABLE users;--`) | `201 Created` (JPA parameterized queries prevent injection) |

---

## 2. Auth — Login (`POST /api/auth/login`)

### Positive Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| P1 | Correct email and password | `200 OK`, valid JWT returned |
| P2 | Login immediately after registration | `200 OK`, fresh JWT returned |

### Negative Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| N1 | Wrong password | `401 Unauthorized`, code `INVALID_CREDENTIALS` |
| N2 | Non-existent email | `401 Unauthorized`, code `INVALID_CREDENTIALS` |
| N3 | Missing email or password | `400 Bad Request`, code `VALIDATION_ERROR` |
| N4 | Empty password string | `400 Bad Request` |
| N5 | Valid email, empty password | `400 Bad Request` |

---

## 3. Work Log — Submit (`POST /api/logs`)

### Positive Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| P1 | Simple text: "Fixed login bug and updated docs" | `201 Created`, 2 structured tasks returned, ai_status=PROCESSED |
| P2 | Multi-task input: "Fixed bug, wrote tests, attended standup, reviewed John's PR" | `201 Created`, 4 structured tasks, correct categories |
| P3 | Very long text (500+ chars) | `201 Created`, AI extracts all relevant tasks |
| P4 | Input with time hints: "spent 3 hours on payment API" | `201 Created`, hours field reflects 3.0 |
| P5 | Single word: "Debugging" | `201 Created`, 1 task returned with estimated hours |

### Negative Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| N1 | No Authorization header | `401 Unauthorized` |
| N2 | Expired JWT token | `401 Unauthorized` |
| N3 | Empty `rawText` field | `400 Bad Request`, code `VALIDATION_ERROR` |
| N4 | Missing `rawText` field | `400 Bad Request` |
| N5 | OpenAI API key invalid/expired | `500 Internal Server Error`, raw log saved with ai_status=FAILED |
| N6 | OpenAI API timeout | `500 Internal Server Error`, raw log saved with ai_status=FAILED |
| N7 | OpenAI returns malformed JSON | `500 Internal Server Error`, fallback saves FAILED status |
| N8 | `rawText` is only whitespace | `400 Bad Request` |

---

## 4. Work Log — Retrieve (`GET /api/logs`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | User with 5 logs | `200 OK`, array of 5 logs, sorted by createdAt DESC |
| P2 | New user with 0 logs | `200 OK`, empty array `[]` |
| P3 | Log with FAILED status | Included in list with `aiStatus: FAILED`, empty structuredTasks |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | No Authorization header | `401 Unauthorized` |
| N2 | User A's token requesting logs | Returns only User A's logs (never User B's data) |

---

## 5. Work Log — Get Single (`GET /api/logs/{id}`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | Valid log ID belonging to auth user | `200 OK`, log with structured tasks |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | Log ID does not exist | `404 Not Found` |
| N2 | Log ID belongs to different user | `404 Not Found` (security: no information leak) |
| N3 | Non-numeric ID in path | `400 Bad Request` |

---

## 6. AI — Manual Retry (`POST /api/ai/process-log`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | Retry on FAILED log | `200 OK`, tasks created, ai_status updated to PROCESSED |
| P2 | Retry on already PROCESSED log | `200 OK`, existing tasks deleted, new tasks created |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | `rawLogId` does not exist | `404 Not Found` |
| N2 | `rawLogId` belongs to different user | `404 Not Found` |
| N3 | AI fails again during retry | `500 Internal Server Error`, status remains FAILED |
| N4 | Missing `rawLogId` | `400 Bad Request` |

---

## 7. Reports — Daily (`GET /api/reports/daily`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | Date with work logs | `200 OK`, tasks listed, AI summary generated/cached |
| P2 | Same date requested twice | `200 OK`, cached report returned (no new AI call) |
| P3 | No `date` param | `200 OK`, uses today's date |
| P4 | Date with no logs | `200 OK`, empty tasks, summary: "No work logged for this date" |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | Invalid date format (e.g. "10-04-2026") | `400 Bad Request` |
| N2 | Future date | `200 OK`, empty tasks (no logs yet) |

---

## 8. Reports — Weekly (`GET /api/reports/weekly`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | Week with logs across multiple days | `200 OK`, breakdown by day, AI summary |
| P2 | No `weekStart` param | `200 OK`, uses current week's Monday |
| P3 | Week with partial data (some days empty) | `200 OK`, 0 hours for empty days |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | Invalid date format | `400 Bad Request` |
| N2 | `weekStart` is not a Monday | API adjusts to nearest Monday or returns `400` |

---

## 9. Analytics (`GET /api/analytics`)

### Positive Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| P1 | Last 7 days with varied logs | `200 OK`, all metrics populated |
| P2 | No date params | `200 OK`, defaults to last 7 days |
| P3 | Date range with only 1 day | `200 OK`, single entry in dailyTrend |
| P4 | User with many logs in range | `200 OK`, correct aggregations |

### Negative Scenarios
| # | Scenario | Expected Result |
|---|----------|-----------------|
| N1 | `endDate` before `startDate` | `400 Bad Request` |
| N2 | Date range > 1 year | `400 Bad Request` (performance guard) |
| N3 | No logs in the date range | `200 OK`, all zeros / empty arrays |

---

## 10. Chat (`POST /api/chat`)

### Positive Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| P1 | "What did I do last week?" | `200 OK`, AI summarizes last week's logs |
| P2 | "How much time did I spend on bugs?" | `200 OK`, AI calculates and responds |
| P3 | "What's my most productive day?" | `200 OK`, AI analyzes daily trends |
| P4 | Very long question | `200 OK`, response based on log context |

### Negative Scenarios
| # | Input | Expected Result |
|---|-------|-----------------|
| N1 | Empty question | `400 Bad Request` |
| N2 | Question with no relevant log data | `200 OK`, AI responds: "No work logs found for this query" |
| N3 | AI API failure during chat | `500 Internal Server Error` |
| N4 | No Authorization header | `401 Unauthorized` |

---

## 11. Security — Cross-Cutting Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| S1 | Access protected endpoint without token | `401 Unauthorized` |
| S2 | Access protected endpoint with tampered JWT | `401 Unauthorized` |
| S3 | Access protected endpoint with expired JWT (after 24h) | `401 Unauthorized` |
| S4 | User A tries to access User B's log by ID | `404 Not Found` (no data leak) |
| S5 | SQL injection in rawText field | Stored as plain text, JPA prevents execution |
| S6 | Prompt injection in rawText (e.g. "Ignore previous instructions...") | AI processes as work log content; server-side prompt template wraps input |
| S7 | CORS request from unauthorized origin | Blocked by CORS policy |
| S8 | Request without Content-Type header | `415 Unsupported Media Type` |
