# KaamSetu API (`Backend/`)

Node.js + Express + Mongoose REST API for the KaamSetu platform.

> 📚 Looking for the big picture? See the [root README](../README.md).
> Deploying? [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) · Rotating keys?
> [docs/KEY_ROTATION.md](../docs/KEY_ROTATION.md) · Endpoint reference:
> [docs/API.md](../docs/API.md)

## Run locally

```bash
cp .env.example .env    # fill in values (every option is annotated)
npm install
npm run dev             # nodemon, http://localhost:5000
npm start               # plain node
```

`GET /health` reports liveness **and** database state.

## Layout

```
src/
├── index.js              # app wiring: security middleware, CORS, rate limits,
│                         # DB connect + retry, health, 404/error handlers
├── controllers/          # auth / jobs / workers / clients / admin logic
├── middleware/
│   ├── auth.js           # user JWT (cookie/Bearer) + role guards
│   └── adminAuth.js      # admin JWT guard for /admin/*
├── models/               # Client, Worker, Job, OTP, Review
├── routes/               # route tables per resource
├── services/             # smsService (Twilio, lazy client)
├── utils/                # cookieOptions, distance (ORS + Haversine fallback), otp, uploads
├── config/               # cloudinary
└── shared/               # constants (skills etc.)
```

## Conventions

- ES modules everywhere (`"type": "module"`) — always include `.js` extensions in imports.
- All secrets from `process.env` — the boot fails fast if `MONGODB_URI` or `JWT_SECRET` is missing.
- Cookies via `getCookieOptions()` — secure-by-default; override through env for local dev.
- Never log OTPs, tokens or credentials.
