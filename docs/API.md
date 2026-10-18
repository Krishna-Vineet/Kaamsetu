# 📡 KaamSetu API Reference

Base URL: `https://api.kaamsetu.co.in` (local: `http://localhost:5000`)

All responses are JSON. Error shape is always:

```json
{ "success": false, "message": "Human readable message", "code": "OPTIONAL_MACHINE_CODE" }
```

## Authentication

Two mechanisms, depending on the caller:

| Caller | Mechanism |
|---|---|
| Web app (clients & workers) | `access_token` (1h) + `refresh_token` (7d) **httpOnly cookies**, renewed on every authenticated request |
| Admin panel | `Authorization: Bearer <admin JWT>` (2h), obtained from `POST /admin/verify` |

Role middleware: `requireRole('client' | 'worker')`; admin routes require a token with `role: 'admin'`.

Rate limits: **300 req / 15 min** globally, **50 req / 15 min** on `/auth/*` and `/admin/verify`.

---

## 🩺 Meta

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness + DB state (`connected` / `connecting` / `disconnected`) |
| GET | `/` | — | API info |

---

## 🔐 Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Start registration; creates a *temporary* user + emails a 6-digit OTP |
| POST | `/auth/verify-otp` | — | Verify registration OTP → permanent user + auth cookies |
| POST | `/auth/resend-otp` | — | New OTP for a pending registration (max 5 resends/window) |
| POST | `/auth/login` | — | `{ data, password, rememberMe? }` → auth cookies |
| POST | `/auth/logout` | — | Clears auth cookies |
| POST | `/auth/refresh-token` | refresh cookie | New access + refresh cookies |
| GET | `/auth/verify` | access cookie | Validate current session → `{ user }` |
| POST | `/auth/forgot-password` | — | Email a password-reset OTP (anti-enumeration response) |
| POST | `/auth/verify-reset-otp` | — | `{ data, code }` → `{ resetToken }` (10 min, purpose-scoped) |
| POST | `/auth/reset-password` | — | `{ resetToken, password }` → sets new password |

> 📬 **OTP delivery modes** — every OTP-issuing endpoint includes
> `delivery: "email" | "sms" | "response"` in its JSON. When email/SMS providers
> aren't configured (demo/fallback mode), `delivery` is `"response"` and the
> OTP itself is included as `devOtp` so the UI can display it. Never log or
> persist `devOtp`.

### Examples

```bash
# Register
curl -X POST $API/auth/register -H 'Content-Type: application/json' -d '{
  "name": "Ravi Kumar", "email": "ravi@example.com",
  "phone": "9876543210", "password": "Secret123", "role": "worker"
}'

# Verify OTP (sets cookies)
curl -c cookies.txt -X POST $API/auth/verify-otp \
  -H 'Content-Type: application/json' -d '{"data":"ravi@example.com","code":"123456"}'

# Login
curl -c cookies.txt -X POST $API/auth/login \
  -H 'Content-Type: application/json' -d '{"data":"ravi@example.com","password":"Secret123"}'

# Password reset (3 steps)
curl -X POST $API/auth/forgot-password  -H 'Content-Type: application/json' -d '{"email":"ravi@example.com"}'
curl -X POST $API/auth/verify-reset-otp -H 'Content-Type: application/json' -d '{"data":"ravi@example.com","code":"123456"}'
curl -X POST $API/auth/reset-password   -H 'Content-Type: application/json' -d '{"resetToken":"<token>","password":"NewSecret123"}'
```

---

## 💼 Jobs — `/jobs`

Auth: cookie + role.

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/jobs/create` | client | Create job (`multipart`, optional `image`) |
| GET | `/jobs/client` | client | Client's own jobs |
| PUT | `/jobs/:jobId/start` | client | Start an assigned job (issues completion OTP) |
| POST | `/jobs/:jobId/complete` | client | Complete job by submitting the OTP |
| PUT | `/jobs/:jobId/cancel` | client | Cancel own job |
| POST | `/jobs/:jobId/rate-worker` | client | Rate worker (1–5 + review) |
| GET | `/jobs/available` | worker | Skill-matched open jobs (`?page&limit&skill&city`) |
| POST | `/jobs/:jobId/accept` | worker | Accept a job |
| GET | `/jobs/worker` | worker | Worker's jobs |
| PUT | `/jobs/:jobId/cancel-worker` | worker | Withdraw from a job |
| GET | `/jobs/:jobId/generate-otp` | worker | Show the completion OTP to hand to the client |
| POST | `/jobs/:jobId/rate-client` | worker | Rate client |

**Lifecycle:** `posted → assigned → active → completed` (+ `cancelled` any time).

---

## 👷 Workers — `/workers`

All routes: cookie + `worker` role.

| Method | Path | Description |
|---|---|---|
| GET/PUT | `/workers/profile` | Read / update profile |
| POST | `/workers/profile-picture` | Upload avatar (multipart) → Cloudinary |
| GET | `/workers/stats` | Earnings, job counts, rating |
| POST | `/workers/send-email-otp` / `/send-phone-otp` | OTP for contact-detail changes |
| POST | `/workers/verify-email-otp` / `/verify-phone-otp` | Confirm contact changes |
| POST | `/workers/change-password` | `{ currentPassword, newPassword }` |
| POST | `/workers/aadhaar-verification` | Upload Aadhaar document |

## 🏠 Clients — `/clients`

Same surface as `/workers` (cookie + `client` role).

---

## 🛡️ Admin — `/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/verify` | — | `{ password }` → `{ token, expiresIn }` *(timing-safe compare, rate-limited)* |
| GET | `/admin/stats` | admin | Platform counters |
| GET | `/admin/distribution/skills` | admin | Workers per skill |
| GET | `/admin/verification/pending` | admin | Pending Aadhaar submissions |
| PATCH | `/admin/verification/approve/:id` | admin | Approve |
| PATCH | `/admin/verification/reject/:id` | admin | Reject |
| GET | `/admin/users` | admin | List/search users (`?role&search&page`) |
| PATCH | `/admin/users/:id/block` / `/unblock` | admin | Account moderation |
| GET | `/admin/jobs` · `/admin/jobs/stats` | admin | Job listing + stats |
| GET | `/admin/reviews` | admin | All reviews |
| DELETE | `/admin/reviews/:id` | admin | Remove abusive review |

```bash
TOKEN=$(curl -s -X POST $API/admin/verify -H 'Content-Type: application/json' \
  -d '{"password":"<ADMIN_PASSWORD>"}' | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" $API/admin/stats
```

---

## HTTP status conventions

| Code | Meaning |
|---|---|
| 400 | Validation / bad OTP / weak password |
| 401 | Missing or expired credentials |
| 403 | Wrong role, blocked account, CORS rejection |
| 404 | Route or resource not found |
| 429 | Rate limited / OTP throttle hit |
| 503 | Database reconnecting (auto-recovers; see `/health`) |
