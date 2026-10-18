<div align="center">

# 🔧 KaamSetu

### India's hyperlocal marketplace connecting households with skilled local workers

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Post a job in minutes. Get matched with verified plumbers, electricians, cleaners,
cooks, tutors and 15+ more trades in your neighbourhood.**

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Docs](#-documentation) · [Deployment](#-deployment)

</div>

---

## 🌟 What is KaamSetu?

**KaamSetu** (काम *सेतु* — "bridge of work") is a full-stack job marketplace built for the
Indian local-services economy. Clients post jobs with one tap; nearby skilled workers
discover, accept and complete them — with OTP-verified milestones, Aadhaar-based identity
verification and a two-way rating system keeping both sides accountable.

It ships as **three production deployables**:

| App | Stack | Audience | Live |
|---|---|---|---|
| **Web App** (`Frontend/`) | React 18 + Vite + Tailwind + shadcn/ui | Clients & Workers | `app.kaamsetu.co.in` |
| **Admin Dashboard** (`Admin/`) | React + Vite + Recharts | Platform operators | `admin.kaamsetu.co.in` |
| **REST API** (`Backend/`) | Node.js + Express + Mongoose | All clients | `api.kaamsetu.co.in` |

> 📁 `legacy/website-v1/` contains the archived v1 (EJS monolith, construction-only).
> Kept for history — **not maintained**.

---

## ✨ Features

### For Clients 🏠
- 🔐 **OTP-verified signup/login** — email OTP via Resend, 6-digit codes with attempt limits & throttling
- 📝 **Post jobs** with skill category, description, photos, location and urgency flags
- 🧭 **Smart discovery** — browse verified workers by skill, city and road distance
- 📊 **Client dashboard** — track every job from *posted → assigned → active → completed*
- ⭐ **Rate workers** after completion; build a trusted hiring history

### For Workers 👷
- 🎯 **Skill-matched job feed** — jobs filtered by the worker's registered skills
- 📍 **Distance-aware matching** — road distance via OpenRouteService, Haversine fallback
- ✅ **OTP-secured job completion** — the job only closes when the client hands over the completion OTP *(no more payment disputes!)*
- 🪪 **Aadhaar verification** — document upload → admin review → verified badge
- 📈 **Earnings & stats dashboard**

### For Admins 🛡️
- 📉 **Live platform stats** — users, verifications, jobs, skill distribution
- 🚦 **Aadhaar Verification Center** — approve/reject with document preview
- 👥 **User management** — search, block/unblock abusive accounts
- 🗑️ **Review moderation**

### Platform 🔧
- 🔑 **JWT auth with rotating httpOnly cookies** (1h access + 7d refresh, sliding sessions)
- 🛡️ **Hardened API** — Helmet CSP, NoSQL-injection sanitization, HPP, CORS allowlist,
  dual rate limits, timing-safe admin auth, fail-fast env validation
- 🖼️ **Cloudinary media pipeline** for profile photos & verification documents
- 📧 **Transactional email** (Resend) + 📱 **SMS OTP** (Twilio, India +91 aware) — *optional*:
  without them the platform runs in a zero-cost **demo mode** where OTPs appear right on screen
- 🩺 **`/health` endpoint** with DB state for uptime monitoring; graceful 503 + auto-reconnect on DB outage

---

## 🏗 Architecture

```
┌──────────────┐        ┌──────────────┐
│   Web App    │        │ Admin Panel  │
│ React + Vite │        │ React + Vite │
└──────┬───────┘        └──────┬───────┘
       │  cookies / Bearer     │
       └───────────┬───────────┘
                   ▼
        ┌─────────────────────┐         ┌──────────────┐
        │   Express REST API  │◄────────│  MongoDB     │
        │  helmet · rate-lim. │         │   Atlas      │
        │  mongo-sanitize     │         └──────────────┘
        └─────────┬───────────┘
   ┌──────────────┼───────────────┬───────────────┐
   ▼              ▼               ▼               ▼
┌────────┐  ┌───────────┐  ┌────────────┐  ┌────────────┐
│ Resend │  │  Twilio   │  │ Cloudinary │  │ OpenRoute  │
│ (email)│  │ (SMS OTP) │  │  (media)   │  │ (distance) │
└────────┘  └───────────┘  └────────────┘  └────────────┘
```

**Job lifecycle** — the heart of the platform:

```
  client                worker                 platform
    │                     │                       │
    │── post job ────────►│                       │
    │                     │── accept ────────────►│  status: assigned
    │── start job ───────────────────────────────►│  completion OTP issued
    │── hands OTP at doorstep                     │
    │                     │── enters OTP ────────►│  status: completed ✔
    │◄────────── two-way rating ─────────────────►│
```

---

## 🚀 Quick Start

**Prerequisites:** Node.js ≥ 18 and a MongoDB connection string
([free Atlas cluster](https://www.mongodb.com/atlas/database) works great).

```bash
# 1. Clone
git clone https://github.com/Krishna-Vineet/Kaamsetu.git
cd Kaamsetu

# 2. Install all three apps
npm run setup

# 3. Configure environment
cp Backend/.env.example  Backend/.env     # fill in values (docs/KEY_ROTATION.md)
cp Frontend/.env.example Frontend/.env    # VITE_API_URL=http://localhost:5000
cp Admin/.env.example    Admin/.env       # VITE_API_URL=http://localhost:5000

# 4. Run (three terminals)
npm run dev:api      # → http://localhost:5000  (API)
npm run dev:web      # → http://localhost:5173  (web app)
npm run dev:admin    # → http://localhost:5174  (admin panel)
```

> 💡 **Local dev over plain HTTP?** Set `COOKIE_SECURE=false` and
> `COOKIE_SAME_SITE=lax` in `Backend/.env` so auth cookies work without HTTPS.

Minimal `.env` for the API (everything else has safe fallbacks):

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/kaamsetu
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_REFRESH_SECRET=<another 96-char hex>
ADMIN_PASSWORD=<long random password>
ADMIN_JWT_SECRET=<another 96-char hex>
```

> 💡 **No email/SMS provider? No problem.** Without `RESEND_API_KEY`/`TWILIO_*`,
> KaamSetu runs in demo mode: verification codes are shown right on the OTP
> screen ("📬 Email services are off — your verification code is…"). Add Resend
> later and real delivery switches on automatically — no code changes.

### 🌱 Seed a playable demo (Gurgaon data)

```bash
npm --prefix Backend run seed
# then open the web app and log in:
#   demo.client@kaamsetu.demo / Client@123
#   demo.worker@kaamsetu.demo / Worker@123
```

16 workers & clients, 16 jobs across the full lifecycle, bidirectional reviews,
Aadhaar states for the admin verification queue, and a blocked account — all
around Gurugram. Idempotent: re-seeding only ever touches demo data.
(The archived v1 app has its own equivalent: `npm --prefix legacy/website-v1 run seed`.)

---

## 📚 Documentation

| Guide | Contents |
|---|---|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deploy: MongoDB Atlas, Render/Railway (API), Vercel (frontends), subdomains, cookies |
| [docs/KEY_ROTATION.md](docs/KEY_ROTATION.md) | **How to obtain & rotate every API key/secret** — step by step, with order-of-operations |
| [docs/API.md](docs/API.md) | REST endpoint reference with request/response shapes |
| [SECURITY.md](SECURITY.md) | Security model, reporting, hardening notes |
| [CHANGELOG.md](CHANGELOG.md) | What changed in the v2.0.0 production-hardening release |
| [Backend/.env.example](Backend/.env.example) | Fully annotated server environment template |

---

## 🧰 Tech Stack

**Frontends** — React 18, Vite 5, Tailwind CSS 3, shadcn/ui + Radix, TanStack Query,
Zustand, React Hook Form + Zod, React Router 6, Recharts (admin), Lucide icons.

**Backend** — Node.js (ESM), Express 4, Mongoose 8, JWT, bcryptjs, Multer,
Helmet, express-rate-limit, express-mongo-sanitize, hpp, Morgan.

**Services** — MongoDB Atlas · Resend (email) · Twilio (SMS) · Cloudinary (media) · OpenRouteService (maps).

**Infra** — Vercel (frontends) · Render/Railway or Vercel serverless (API).

---

## 📁 Repository Layout

```
Kaamsetu/
├── Frontend/          # React web app (clients & workers)
├── Admin/             # Admin dashboard (React)
├── Backend/           # Express REST API
│   └── src/
│       ├── controllers/  models/  routes/  middleware/
│       ├── services/     utils/   config/  shared/
├── docs/              # Deployment · API · Key rotation
├── legacy/
│   └── website-v1/    # ⚠️ archived v1 (EJS) — do not deploy
└── package.json       # monorepo convenience scripts
```

---

## 🗺 Roadmap

- [ ] Payments (Cashfree/UPI) escrow for jobs
- [ ] Real-time chat between client & worker (Socket.io rooms)
- [ ] Hindi + regional language i18n
- [ ] Worker payout ledger & tax-ready exports
- [ ] Redis-backed rate limiting & sessions for multi-instance scale

---

## 👨‍💻 Author

**Made by Vineet**

Originally built at a startup; since taken over, hardened for production and
maintained independently.

- GitHub — [@Krishna-Vineet](https://github.com/Krishna-Vineet)

---

## 📄 License

[MIT](LICENSE) © 2025–2026 Vineet

<div align="center">
  <sub>Built with ♥ in India · KaamSetu — kaam ka setu, bharosa full.</sub>
</div>
