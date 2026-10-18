# ⚠️ legacy/ — Archived Code, Do Not Deploy

## `website-v1/`

The original **KaamSetu v1** (2025): a server-rendered EJS monolith focused purely on
construction labour. It was superseded by **v2** — the broader multi-trade platform in
the repository root (`Frontend/` + `Admin/` + `Backend/`).

- **Status:** archived, unmaintained, receives **no security updates**
- **Do not deploy** or build new work on it; kept only for historical reference

---

## 👀 Running v1 as a local demo (nostalgia mode)

It boots fine on modern Node **with or without a database**:

```bash
cd legacy/website-v1
npm install
copy .env.example .env        # Windows   (cp .env.example .env on macOS/Linux)
npm start
# → http://localhost:3000
```

**No MongoDB handy?** Leave `MONGO_URI` unset/invalid — the app starts in
**view-only demo mode** (a v2.1-era patch): all the marketing pages render —
home, FAQ, privacy policy, terms, login view, client/labor registration views —
while login, dashboards and admin screens (which query the DB) will fail.
Point `MONGO_URI` at a real cluster for the full interactive experience.

⚠️ v1 uses **different env names** than v2 (`MONGO_URI`, not `MONGODB_URI`).

### 🌱 Seed a playable demo (Gurgaon demo data)

With `MONGO_URI` set, plant realistic demo content and log straight in:

```bash
npm run seed        # idempotent — wipes only demo (@kaamsetu.demo) data
npm start           # → http://localhost:3000/loginPage
```

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kaamsetu.demo` | `Admin@123` |
| Client | `demo.client@kaamsetu.demo` | `Client@123` |
| Labor | `demo.labor@kaamsetu.demo` | `Labor@123` |

The seed creates **10 laborers** (mason, electrician, plumber, painter, carpenter,
tile-fitter, welder, POP-ceiling, AC-tech, helper), **5 clients**, **11 jobs**
around Gurugram (posted → the labor "Available Jobs" page, active with progress
updates, completed with payments + 5★ ratings, one cancelled, one open dispute)
— so every dashboard, admin screen, payments and ratings page has content.
Re-running `npm run seed` resets only the demo data; your real data is untouched.

> 🔑 Admin in v1 is just a user with `role: "admin"` (no separate password):
> after logging in you land on `/admin/dashboard/<id>` with user/job/payment/
> dispute management.

### Compat fixes applied for modern Node (documented, intentional)

| Change | Why |
|---|---|
| `bcrypt` → `bcryptjs` | the native C++ module fails to build on Node ≥ 20; bcryptjs is a pure-JS drop-in with the same API |
| `connect.js` no longer `process.exit(1)` on DB failure | enables DB-less "view-only demo mode" |
| `renderLogin` serves `login.html` with HTTP 200 | it previously returned 401 and contained an unreachable, broken `awaitUser` lookup that would crash for authenticated visitors |

### Known quirks (left as-is, archived code)

- CSP header in `server.js` allows `'unsafe-inline'` — one of many reasons v1
  must never be redeployed.
- Some dashboard pages assume 2025-era data shapes.
