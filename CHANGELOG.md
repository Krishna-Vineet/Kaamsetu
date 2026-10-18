# Changelog

All notable changes to KaamSetu are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
