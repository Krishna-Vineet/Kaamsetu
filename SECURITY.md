# 🛡️ Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security reports.
Email the maintainer via the address on
[@Krishna-Vineet](https://github.com/Krishna-Vineet)'s profile, or open a private
[GitHub Security Advisory](https://github.com/Krishna-Vineet/Kaamsetu/security/advisories/new).

You can expect an acknowledgement within 72 hours.

## Security model (as of v2.0.0)

| Layer | Measure |
|---|---|
| Transport | HTTPS required everywhere; HSTS via Helmet |
| AuthN | bcrypt (12 rounds) passwords; JWT access (1h) + refresh (7d) in **httpOnly Secure SameSite=None** cookies; sliding renewal on every request |
| Admin | Separate password + timing-safe comparison + short-lived (2h) admin JWT (`Bearer`) distinct from user tokens |
| OTPs | 6 digits, 10-min TTL, max 3 verify attempts, max 5 resends, plaintext codes never logged |
| Password reset | Purpose-scoped 10-min JWT (`purpose: 'password-reset'`) — unusable as an auth token; OTP deleted after use (no replay) |
| AuthZ | Role middleware per route group (`client` / `worker` / `admin`); blocked accounts rejected at the middleware |
| Injection | `express-mongo-sanitize` (NoSQL), `hpp` (param pollution), Mongoose parameterized queries |
| XSS | Helmet CSP; tokens are httpOnly so JS can't read them |
| Rate limiting | 300/15m global, 50/15m on `/auth/*` & `/admin/verify` (swap in Redis when scaling horizontally) |
| CORS | Explicit origin allowlist via `ALLOWED_ORIGINS`; 403 on foreign origins |
| Secrets | Everything env-based; `.env*` git-ignored; boot fails fast if `MONGODB_URI`/`JWT_SECRET` missing |
| Availability | DB auto-reconnect with backoff + fast 503 while down instead of crash loops |

## Known limitations / hardening roadmap

- **OTP fallback mode** (v2.1.0): when Resend/Twilio are not configured — or
  `OTP_FALLBACK_TO_RESPONSE=true` — OTPs are returned in API responses and shown
  in the UI. In this mode email/SMS ownership is NOT verified, so anyone can
  register or reset any account. Great for demos; **do not run production this
  way**. Configure Resend (`RESEND_API_KEY` + `EMAIL_FROM`) to disable it.
- In-memory rate limiting resets per instance — move to Redis/Upstash for multi-instance.
- Local-disk `uploads/` are not suited to serverless — migrate fully to Cloudinary storage.
- No account lockout yet beyond OTP attempt caps; consider per-account login throttling.
- Add 2FA for admin panel beyond the shared password (e.g. TOTP).

## Out of scope

The archived v1 in `legacy/website-v1/` is **not maintained** and receives no
security updates. Do not deploy it.
