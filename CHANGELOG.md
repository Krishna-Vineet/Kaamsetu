# Changelog

All notable changes to KaamSetu are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### ✨ Added

- **v1 demo seed** (`legacy/website-v1`, `npm run seed`) — realistic Gurugram
  demo content: 10 laborers, 5 clients, 11 jobs across the full lifecycle,
  payments, 5★ ratings and an open dispute, plus ready demo logins
  (`admin@kaamsetu.demo`, `demo.client@kaamsetu.demo`, `demo.labor@kaamsetu.demo`).
  Idempotent; only demo data is ever wiped.
- **Run v1 locally** — the archived EJS app now boots on modern Node with or
  without a database (view-only demo mode for the marketing pages). Added
  `legacy/website-v1/.env.example` and run instructions in `legacy/README.md`.
  Compat fixes: native `bcrypt` → `bcryptjs`, DB-less boot, login page returns 200.
- **`npm run env:check`** — env doctor (`Backend/scripts/check-env.mjs`) that
  audits `Backend/.env` exactly as the server loads it: per-variable status
  with masked values, plus forensics for the classic setup killers (`.env` in
  the wrong folder, UTF-8 BOM, smart “quotes” from Windows editors, and
  unrecognised/typo'd variable names like `MONGO_URI`).
- Boot failure message now points at `env:check` and lists the common causes.

### 🐛 Fixes

- Admin panel: `useAuthNavigation().login()` swallowed the session token, so
  every admin API call went out unauthenticated (401). Tokens are now persisted
  and any 401 outside `/admin/verify` redirects to the login screen.

## [2.1.0] — 2026-10-18 — "Zero-Cost Demo Mode" 📬

### ✨ Added

- **OTP fallback delivery mode** — when Resend/Twilio are not configured (or
  `OTP_FALLBACK_TO_RESPONSE=true` is set), OTPs are returned in API responses
  (`devOtp`) instead of crashing or silently failing. The OTP screen shows a
  prominent amber banner — *"📬 Email services are off — your verification code
  is …"* — and prefills the code. Covers registration, OTP resend, password
  reset and phone-number changes, so the whole platform works end-to-end with
  **zero messaging spend**; add Resend later and it switches to real delivery
  automatically.
- Boot logs now warn loudly whenever fallback delivery is active.
- OTP-issuing endpoints return `delivery: "email" | "sms" | "response"` so
  clients can render the right UX.

### 🐛 Fixes

- Removed a remaining plaintext phone-OTP log line in `client.js`.
- Register responses now include the account `email` (fixes the mobile hook
  flow that read `data.email`).

### ⚠️ Security note

Fallback mode trades proof-of-inbox for zero-config demos: **anyone can verify
or reset any account while it's active**. Enable Resend before production use.
See [SECURITY.md](SECURITY.md).

## [2.0.0] — 2026-10-18 — "Production Hardening" 🚀

First independently-maintained release after the project was taken over from the
original startup. Focus: make it safe for real users.

### 🔒 Security (critical fixes)

- **Secured every `/admin/*` route** — they were previously reachable with *zero
  authentication* (anyone could block users, delete reviews, read platform stats).
  Admin access now requires a short-lived JWT issued by `POST /admin/verify`.
- **Removed hardcoded OpenRouteService API keys** from `Backend/src/utils/distance.js`
  and `Frontend/src/utils/distance.js`. Old keys must be revoked —
  see [docs/KEY_ROTATION.md](docs/KEY_ROTATION.md).
- **Removed MongoDB URI logging** — the full connection string (with credentials)
  was printed to server logs on every boot.
- **Cookies are now secure-by-default** (`httpOnly` + `Secure` defaulted to true;
  previously they defaulted to *off* unless env vars were set, exposing tokens to XSS).
- Admin password comparison is now **timing-safe** (`crypto.timingSafeEqual`).
- Stopped logging OTP codes and per-request user PII.

### ✨ Added

- **Forgot/reset password end-to-end** — `POST /auth/forgot-password`,
  `/auth/verify-reset-otp`, `/auth/reset-password` with a purpose-scoped 10-minute
  reset JWT, OTP attempt limits and anti-enumeration responses. The frontend pages
  are now fully wired (they previously dead-ended).
- **Resend OTP** for pending registrations: `POST /auth/resend-otp`; the UI's
  "Resend Code" button finally works.
- **Edge security middleware actually enabled**: Helmet (CSP), `express-mongo-sanitize`,
  `hpp`, Morgan request logging — all were installed but never used.
- **Rate limiting**: 300/15m global, 50/15m on auth & admin-login endpoints.
- Env validation at boot (fail fast on missing `MONGODB_URI`/`JWT_SECRET`, warn on
  weak/missing secrets).
- `GET /health` now reports database state; API returns graceful 503 + auto-reconnect
  during DB blips instead of hanging or crash-looping.
- Admin panel: sessions persist across refresh (sessionStorage-backed token),
  automatic logout on 401, SPA fallback `vercel.json`.
- Fully annotated `.env.example` files for all three apps (previously git-ignored).
- Docs: root README, [DEPLOYMENT](docs/DEPLOYMENT.md), [API reference](docs/API.md),
  [KEY_ROTATION](docs/KEY_ROTATION.md), SECURITY.md, this changelog.

### 🐛 Fixes

- `verifyOTP` crashed (`ReferenceError: email is not defined`) when the user wasn't
  found — returned a misleading 500; now a proper 404.
- Reset-password cookie attributes (`Domain=localhost`) could silently break cookies
  in production — cookies now share one hardened option builder
  (`src/utils/cookieOptions.js`).
- `Backend/src/utils/distance.js` imported `axios`, which was never declared in
  `package.json` (latent crash) — replaced with native `fetch` + timeout.
- CORS errors now return 403 instead of a confusing 500.
- `res.cookie` deletion on logout now uses matching attributes so cookies actually clear.
- Resend & Twilio clients are lazily initialised — a missing email/SMS key no longer
  crashes the whole API at boot.

### 🔄 Changed

- Repository layout: v1 (EJS app, `website/`) archived to `legacy/website-v1/`;
  it is deprecated and unmaintained. V2 apps keep their names (`Frontend`, `Admin`,
  `Backend`) so existing Vercel root-directory settings keep working.
- `app.listen` is skipped on serverless (`VERCEL=1`); Mongoose connections are cached
  across warm invocations.
- CORS allowlist is env-driven (`ALLOWED_ORIGINS`); localhost automatically allowed
  outside production.
- "Made by Vineet" credit added to the web app footer.

### 🗑 Removed

- Noisy/PII `console.log` statements in auth paths.

[2.0.0]: https://github.com/Krishna-Vineet/Kaamsetu/releases/tag/v2.0.0
