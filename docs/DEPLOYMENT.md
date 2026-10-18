# 🚢 Production Deployment Guide

Battle-tested topology for KaamSetu:

```
app.<domain>      (Vercel)  → web app        (Frontend/)
admin.<domain>    (Vercel)  → admin panel    (Admin/)
api.<domain>      (Render / Railway / Vercel serverless) → REST API (Backend/)
database          → MongoDB Atlas (M0 free tier is fine to start)
```

All three hostnames on one root domain keeps cookie-based auth simple
(`SameSite=None; Secure` across subdomains).

---

## 1️⃣ MongoDB Atlas

1. https://cloud.mongodb.com → **Build a Database** → M0 Free → AWS, closest region (Mumbai = `ap-south-1` for Indian users).
2. **Security → Database Access** → add user with a generated password.
3. **Security → Network Access** → allow your API host's IPs (Render/Railway static outbound IPs; serverless = `0.0.0.0/0` unavoidable unless you use Vercel Static IPs).
4. **Connect → Drivers → Node.js** → copy the URI into `MONGODB_URI`.
5. Create collections happens automatically on first write. ✅ Verify from the API: `GET /health` → `"database": "connected"`.

## 2️⃣ API — Render (recommended) / Railway / Vercel

### Render
- **New → Web Service** → connect repo → **Root Directory: `Backend`**
- Build: `npm install` · Start: `npm start`
- Env: everything in [`Backend/.env.example`](../Backend/.env.example), set:
  ```env
  NODE_ENV=production
  MONGODB_URI=…
  JWT_SECRET / JWT_REFRESH_SECRET / ADMIN_JWT_SECRET   # three different 96-char hex values
  ADMIN_PASSWORD=…
  RESEND_API_KEY / EMAIL_FROM / EMAIL_FROM_NAME
  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER
  CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
  OPENROUTESERVICE_API_KEY
  ALLOWED_ORIGINS=https://<domain>,https://www.<domain>,https://app.<domain>,https://admin.<domain>
  COOKIE_HTTP_ONLY=true
  COOKIE_SECURE=true
  COOKIE_SAME_SITE=none
  ```
- Render's own health check path: `/health`.

### Railway
Same env; set root directory `Backend`, start command `npm start`.

### Vercel (serverless, optional)
- Project root = `Backend` (the included `Backend/index.js` + `.vercel/` handle this).
- `app.listen` is automatically skipped when `VERCEL=1`; the Mongoose connection is cached across warm invocations.
- ⚠️ In-memory rate limiting and local `uploads/` don't persist on serverless —
  prefer Render/Railway for the API, or move uploads to Cloudinary-only storage.

## 3️⃣ Web app + Admin panel — Vercel

For **each** of `Frontend` and `Admin`:

1. Vercel → **Add New → Project** → import repo → **Root Directory: `Frontend`** (resp. `Admin`).
2. Framework preset: **Vite** (auto-detected; `vercel.json` SPA rewrites included).
3. Env: `VITE_API_URL=https://api.<domain>` (Frontend optionally `VITE_ORS_API_KEY`).
4. Deploy → assign subdomain `app.<domain>` / `admin.<domain>` (*Settings → Domains*).

> 📌 The repo folders (`Frontend`, `Admin`, `Backend`) map 1:1 to Vercel "Root
> Directory" settings — if you ever rename the folders, update the setting first
> or the next deploy fails.

## 4️⃣ DNS & cookies

| Record | Value |
|---|---|
| `A` / `CNAME` `app` | Vercel |
| `CNAME` `admin` | Vercel |
| `CNAME` `api` | Render/Railway/Vercel |

Auth cookies are issued by `api.<domain>` and travel on every request from the
frontends (fetch `credentials: 'include'` is already in the code). Requirements:
HTTPS everywhere (all three hosts) + `COOKIE_SECURE=true` + `COOKIE_SAME_SITE=none`.
Optionally set `COOKIE_DOMAIN=.<domain>` to share cookies across subdomains.

## 5️⃣ Smoke test after deploy

```bash
curl https://api.<domain>/health                       # database: connected
curl -X POST https://api.<domain>/auth/login …         # 200 / proper error
# open https://admin.<domain> → sign in with ADMIN_PASSWORD
# register a user on https://app.<domain> → OTP email arrives → verify → dashboard
```

## 6️⃣ Ongoing operations

- **Logs**: `morgan` writes request logs to stdout (Render/Railway capture them; Vercel → *Observability*).
- **Uptime**: point UptimeRobot/BetterStack at `https://api.<domain>/health` (checks DB too).
- **Key rotation**: see [KEY_ROTATION.md](KEY_ROTATION.md).
- **Zero-downtime env changes**: update env vars, redeploy; sessions survive (JWT is stateless) unless you rotated `JWT_SECRET` — that intentionally logs everyone out once.

---

### Local production-mode check

```bash
# Backend/.env: NODE_ENV=production, COOKIE_* per .env.example, real MONGODB_URI
cd Backend && npm start
# Frontends
cd ../Frontend && npm run build && npm run serve
```
