# CPS Website – Database Schema & Developer Documentation

A competitive Clicks-Per-Second (CPS) web application built with **MySQL + ERN (Express, React, Node)**, using **JWT authentication** and a server-validated leaderboard system.

---

## PART 1 – Refined Database Schema (MySQL)

### Design Goals
- Fast leaderboard queries
- Easy cheat invalidation
- JWT-friendly authentication
- Expandable (future modes, seasons, bans)

---

## 1. `users` Table

Stores user credentials and public profile data.

```sql
CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY,
  username      VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  display_name  VARCHAR(32),
  avatar_url    TEXT,

  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,

  is_banned     BOOLEAN DEFAULT FALSE
);
```

### Notes
- `CHAR(36)` stores UUIDs as strings (Node-friendly)
- `display_name` allows rebranding without breaking leaderboard identity
- `is_banned` enables shadow-banning without deleting historical data

---

## 2. `click_tests` (Core Competitive Data)

Each row represents a single CPS test attempt.

```sql
CREATE TABLE click_tests (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,

  duration_ms   INT NOT NULL,            -- e.g. 5000, 10000
  total_clicks  INT NOT NULL,
  cps           DECIMAL(5,2) NOT NULL,

  device_type   VARCHAR(32),
  browser       VARCHAR(64),
  user_agent    TEXT,

  started_at    DATETIME NOT NULL,
  ended_at      DATETIME NOT NULL,

  is_valid      BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Why This Structure Works
- Each test is immutable history
- Runs can be invalidated without deletion
- Supports multiple CPS modes automatically

---

## 3. `flagged_tests` (Anti-Cheat & Moderation)

Tracks suspicious or invalid CPS attempts.

```sql
CREATE TABLE flagged_tests (
  id            CHAR(36) PRIMARY KEY,
  click_test_id CHAR(36) NOT NULL,

  reason        VARCHAR(255) NOT NULL,
  flagged_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (click_test_id) REFERENCES click_tests(id) ON DELETE CASCADE
);
```

### Example Reasons
- `IMPOSSIBLE_CPS`
- `AUTOCLICK_PATTERN`
- `ZERO_VARIANCE`
- `CLIENT_TAMPERING`

---

## 4. `user_stats` (Cached Leaderboard Optimization)

Stores cached user performance data for fast rendering.

```sql
CREATE TABLE user_stats (
  user_id       CHAR(36) PRIMARY KEY,

  best_cps      DECIMAL(5,2),
  avg_cps       DECIMAL(5,2),
  total_tests   INT DEFAULT 0,

  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Why This Exists
- Faster homepage and profile pages
- Leaderboards still derive from `click_tests` (source of truth)

---

## 5. Indexes (Very Important)

Indexes required for fast leaderboard and profile queries.

```sql
CREATE INDEX idx_click_tests_user
ON click_tests(user_id);

CREATE INDEX idx_click_tests_cps
ON click_tests(cps DESC);

CREATE INDEX idx_click_tests_valid
ON click_tests(is_valid);

CREATE INDEX idx_click_tests_duration
ON click_tests(duration_ms);

CREATE INDEX idx_users_username
ON users(username);
```

---

## 6. What Is NOT Stored (On Purpose)

| Not Stored | Reason |
|------------|--------|
| Raw click timestamps | Keeps database lean |
| Leaderboard rows | Derived from `click_tests` |
| Session records | JWT handles authentication |

This keeps the database lean, fast, and cheat-resistant.

---

## PART 2 – Developer Documentation

### System Overview

```
Frontend (React)
  └─ Axios
      └─ Express API
          ├─ JWT Auth Middleware
          ├─ CPS Validation
          └─ MySQL
```

---

## Authentication Flow (JWT)

### Signup
1. User submits username + password
2. Password is hashed using bcrypt
3. User record is created in the database
4. JWT is issued and returned

### Login
1. Validate username
2. Compare password hash
3. Issue JWT

### JWT Payload
```json
{
  "userId": "uuid",
  "username": "player123"
}
```

### JWT Storage Options
- **HttpOnly cookies** (recommended)
- **localStorage** (acceptable but less secure)

---

## CPS Test Submission Flow

### Client-Side
1. Start timer
2. Count clicks locally
3. Submit results once per test

### POST `/api/click-test`
```json
{
  "duration_ms": 10000,
  "total_clicks": 134,
  "started_at": "2026-02-05T10:00:00Z",
  "ended_at": "2026-02-05T10:00:10Z",
  "device_type": "desktop",
  "browser": "Chrome"
}
```

### Server-Side Validation

#### Before Insert
- Verify duration matches server time tolerance
- Reject absurd CPS values (e.g. > 25)
- Validate time delta consistency
- Detect suspicious clicking patterns

#### If Valid
- Insert record into `click_tests`
- Update `user_stats`

#### If Suspicious
- Insert record with `is_valid = false`
- Add entry to `flagged_tests`

---

## Leaderboard Logic (Read-Only)

### Global Top 100 (10-Second Mode)
```sql
SELECT
  u.username,
  MAX(ct.cps) AS best_cps
FROM click_tests ct
JOIN users u ON u.id = ct.user_id
WHERE ct.is_valid = true
  AND ct.duration_ms = 10000
  AND u.is_banned = false
GROUP BY u.id
ORDER BY best_cps DESC
LIMIT 100;
```

### Personal Best
```sql
SELECT MAX(cps)
FROM click_tests
WHERE user_id = ?
  AND is_valid = true;
```

---

## Moderation Strategy

### Soft Ban
```sql
UPDATE users
SET is_banned = true
WHERE id = ?;
```

### Effect
- User can still log in
- Scores are excluded from leaderboards

---

## Scaling Notes (Future-Proofing)

- Add a `seasons` table if ranked resets are needed
- Use **Redis** to cache top 100 leaderboards
- Use **WebSockets** for live leaderboard updates
- Add daily or weekly CPS modes without schema changes

---

## Final Schema Summary

```
users
 ├── click_tests
 │    └── flagged_tests
 │
 └── user_stats
```
