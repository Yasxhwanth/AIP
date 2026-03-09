# Production Readiness Policy

> **This document is mandatory reading before any production deployment.**
> Every control listed here must be satisfied. Non-compliance is a deployment blocker.

---

## 1. Required Environment Variables

The server will **refuse to start** (`process.exit(1)`) if any of these are missing in production:

| Variable | Purpose | Fail-fast? |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | ✅ Always |
| `JWT_SECRET` | Signs all auth tokens. Min 32 chars, high entropy. | ✅ Always |
| `CORS_ORIGIN` | Comma-separated allowed origins, e.g. `https://app.example.com` | ✅ In production |

Optional but strongly recommended in production:

| Variable | Purpose | Default (insecure) |
|---|---|---|
| `NODE_ENV` | Set to `production` to enable all security controls | `development` |
| `REDIS_URL` | Redis for caching. Without it, cache is disabled. | None (disabled) |
| `RABBITMQ_URL` | RabbitMQ for async ingestion. Falls back to sync. | `amqp://localhost` |
| `PORT` | Server listen port | `3001` |

---

## 2. Security Controls Checklist

Before deploying, verify each of the following:

- [ ] `JWT_SECRET` is a cryptographically random string (≥32 chars). **Never** use a default or predictable value.
- [ ] `CORS_ORIGIN` is set to an explicit allowlist. No wildcard `*` in production.
- [ ] `NODE_ENV=production` is set — enables fail-fast security checks.
- [ ] HTTPS is terminated at the load balancer or reverse proxy. The server itself speaks plain HTTP internally.
- [ ] API keys are created via `POST /api/v1/auth/api-keys` — the raw key is returned **only once** and never stored.
- [ ] Rotate API keys after any suspected exposure via `POST /api/v1/auth/keys/:id/rotate`.
- [ ] All admin-role operations require a valid JWT via Bearer token (`POST /api/v1/auth/token`).

---

## 3. Health Monitoring

Use the deep health endpoint for monitoring. It reflects **real runtime state**, not static strings.

```
GET /api/v1/health/deep
```

**Healthy response (HTTP 200):**
```json
{
  "status": "ok",
  "database": { "status": "connected", "latencyMs": 3 },
  "schedulers": {
    "jobScheduler":    { "status": "ok", "lagMs": 62000, "lastTickAt": "...", "lastError": null },
    "rollupScheduler": { "status": "ok", "lagMs": 305000, "lastTickAt": "...", "lastError": null }
  },
  "timestamp": "..."
}
```

**Degraded response (HTTP 503)** — page on-call immediately:
```json
{
  "status": "degraded",
  "schedulers": {
    "jobScheduler": { "status": "stalled", "lagMs": 145000, ... }
  }
}
```

### Scheduler Status Values

| Status | Meaning | Action |
|---|---|---|
| `ok` | Last tick within 2× expected interval | None |
| `stalled` | No tick for > 2× expected interval | Restart server / investigate |
| `error` | Last tick threw an exception | Check `lastError`, review logs |
| `not_started` | Scheduler was never initialized | Verify startup sequence |

### Recommended Alert Thresholds

| Signal | Threshold | Severity |
|---|---|---|
| HTTP 503 on `/api/v1/health/deep` | Any occurrence | **CRITICAL** |
| `jobScheduler.lagMs` > 180,000 ms | (3 min) | WARNING |
| `rollupScheduler.lagMs` > 900,000 ms | (15 min) | WARNING |
| `database.latencyMs` > 500 ms | Sustained | WARNING |

---

## 4. Known Dev-Mode Bypasses (Must Not Reach Production)

These behaviors are intentionally relaxed in development. They are **blocked in production** by fail-fast checks.

| Bypass | Dev behavior | Production behavior |
|---|---|---|
| `AUTH_REQUIRED=false` | Skips API key/JWT check entirely | **Not allowed** — env check blocks it |
| No `CORS_ORIGIN` | Allows all origins (`*`) + logs warning | `process.exit(1)` at startup |
| No `JWT_SECRET` | `process.exit(1)` immediately | Same |
| Missing `DATABASE_URL` | `process.exit(1)` immediately | Same |
| `DEFAULT_PROJECT_ID` (global) | Auto-creates a default project on startup | Only in non-production |

---

## 5. Pre-deployment Checklist

Run through this before every production release:

```
[ ] 1. All required env vars are set and validated
[ ] 2. NODE_ENV=production
[ ] 3. curl /api/v1/health/deep returns HTTP 200
[ ] 4. curl /api/v1/health returns { "status": "ok" }
[ ] 5. At least one API key exists with ADMIN role (for bootstrapping)
[ ] 6. CORS tested against your frontend origin
[ ] 7. Prisma migrations are up to date: npx prisma migrate deploy
[ ] 8. No AUTH_REQUIRED=false in environment
[ ] 9. Redis and RabbitMQ connections verified (if used)
[ ] 10. Graceful shutdown tested (SIGTERM → server closes cleanly)
```
