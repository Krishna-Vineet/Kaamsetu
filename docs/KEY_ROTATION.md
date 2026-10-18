# 🔑 API Key & Secret Rotation Guide

Every third-party credential KaamSetu uses, where it's consumed, **how to get a new
one**, and **how to rotate it safely with zero downtime**.

> ⚠️ **Why rotation is mandatory here:**
> 1. Previous team members had access to the production env vars.
> 2. Two OpenRouteService API keys were **hardcoded in the source code** (found during
>    the v2.0.0 hardening and removed — but they live on in git history, so treat
>    every ORS key from that era as compromised and revoke them).

---

## 🗺 The Rotation Order (important — follow this sequence)

1. **MongoDB Atlas** (new DB password first — everything depends on the DB)
2. **JWT secrets** (invalidates all sessions — do it together with a deploy)
3. **Admin credentials** (`ADMIN_PASSWORD` + `ADMIN_JWT_SECRET`)
4. **Resend API key** (email OTP)
5. **Twilio auth token** (SMS OTP)
6. **Cloudinary API secret** (media)
7. **OpenRouteService key** (distance)
8. Rotate **where the values live**: Render/Railway env vars → redeploy API →
   Vercel env vars → redeploy frontends (only if `VITE_*` values changed).

Workflow per secret: **create new → update env → redeploy → verify → revoke old.**
Never revoke the old key before the new one is live and verified.

---

## 1. MongoDB Atlas — database password

**Used by:** `MONGODB_URI` (API).

**Get a new one:**
1. https://cloud.mongodb.com → select your project
2. Left nav → **Security → Database Access**
3. Edit your DB user (or **Add New Database User**) → **Edit Password** → *Autogenerate Secure Password*
4. Copy it, then rebuild the URI:
   ```
   mongodb+srv://<username>:<NEW_PASSWORD>@<cluster>.mongodb.net/kaamsetu?retryWrites=true&w=majority
   ```

**Rotate:**
- Update `MONGODB_URI` in your host's env (Render: *Environment* tab → *Save Changes* triggers
  redeploy; Vercel serverless: *Settings → Environment Variables* → **Redeploy**).
- Verify: `GET https://api.<your-domain>/health` → `"database": "connected"`.
- Only then delete/disable the old DB user.
- While you're in Atlas: check **Network Access** — restrict to your host's IPs if possible
  instead of `0.0.0.0/0`.

---

## 2. JWT secrets — `JWT_SECRET`, `JWT_REFRESH_SECRET`

**Used by:** API to sign/verify auth tokens (cookies).

**Generate new ones** (never reuse, never invent by hand):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run it **twice** — the two secrets must be different.

**Rotate:**
- Update both in the API env and redeploy.
- ⚠️ **Side effect: every user is logged out once.** That's the point of rotation.
  Schedule it in a quiet hour and it becomes invisible.

---

## 3. Admin credentials — `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`

**Used by:** the admin panel login (`POST /admin/verify`) and admin session tokens.

**Generate new ones:**
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"  # ADMIN_PASSWORD
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"        # ADMIN_JWT_SECRET
```

**Rotate:** update both in the API env → redeploy → sign in to the admin panel once
with the new password to confirm. Old admin sessions die immediately.

---

## 4. Resend — `RESEND_API_KEY`, `EMAIL_FROM`

**Used by:** registration + password-reset OTP emails.

> 💡 **Optional!** As of v2.1.0, if Resend is not configured the API falls back
> to showing OTPs on screen (demo mode). Skip this section until you have a
> domain — note that Resend requires a **verified sending domain** to email
> arbitrary users (`onboarding@resend.dev` only mails your own address).

**Get a new one:**
1. https://resend.com/api-keys → **Create API Key** (name it `kaamsetu-prod`)
2. Sending domain: https://resend.com/domains → add/verify your domain (DNS records),
   then set `EMAIL_FROM=no-reply@<your-domain>`. For testing you can use
   `onboarding@resend.dev`.
3. Copy the key (`re_…`) — shown **once**.

**Rotate:** update `RESEND_API_KEY` (and `EMAIL_FROM` if the domain changed) → redeploy API →
register a throwaway account and confirm the OTP email lands → **delete** the old key in Resend.

---

## 5. Twilio — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**Used by:** SMS OTPs (job completion, phone verification).

> 💡 **Optional!** Without Twilio the API falls back to showing phone OTPs on
> screen (demo mode, v2.1.0). Skip this section until you're ready to pay for SMS.

**Get a new auth token:**
1. https://console.twilio.com → Account dashboard → **Auth Token** → *Request to
   rotate* (docs: https://support.twilio.com → "Rotate Auth Token")
2. Twilio issues a **secondary token** — deploy with the secondary as the new
   `TWILIO_AUTH_TOKEN`, verify an SMS, then promote it & revoke the primary.
   This gives you true zero-downtime rotation.
3. Phone number: *Phone Numbers → Active numbers* (E.164 format, e.g. `+91…` / `+1…`).
   For India SMS delivery, register your sender ID/templates per TRAI DLT rules.

**Verify:** trigger a phone-verification OTP from the app.

> 💡 The SID (`AC…`) stays the same across token rotations — only rotate the token.

---

## 6. Cloudinary — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Used by:** profile photos & Aadhaar document uploads.

**Get a new secret:**
1. https://console.cloudinary.com → **Settings → API Keys**
2. **Generate New API Key** (or regenerate the secret if you use the global pair)
3. Note all three values

**Rotate:** update the API env → redeploy → upload a profile picture in the app →
then delete the old key pair in Cloudinary. Don't rotate the `CLOUD_NAME` — that's
your account identifier and doesn't change.

---

## 7. OpenRouteService — `OPENROUTESERVICE_API_KEY` (+ `VITE_ORS_API_KEY`)

**Used by:** road-distance calculations. Optional — without it KaamSetu falls back to
straight-line (Haversine) distance.

> 🚨 **Revocation first:** the two keys previously hardcoded in the repo must be
> deleted regardless of anything else you do.

**Get a new one:**
1. https://openrouteservice.org → Sign up (free) → **Dashboard → Tokens**
2. **Create Token** → name it `kaamsetu`
3. Free tier: 2,000 requests/day — plenty for this use case

**Rotate:** update `OPENROUTESERVICE_API_KEY` (API) and, if you use the browser-side
distance display, `VITE_ORS_API_KEY` in the web app's Vercel env → redeploy both →
in ORS dashboard **delete the old keys**. For the browser key, add domain restrictions
in the ORS dashboard since it's public by nature.

---

## 🏭 Where these live in production

| Platform | Path | Notes |
|---|---|---|
| Render (API) | Service → **Environment** → Add/Edit → Save (auto-redeploys) | Use `NODE_ENV=production` |
| Railway (API) | Service → **Variables** → edit → redeploy | — |
| Vercel (API serverless) | Project → **Settings → Environment Variables** → **Redeploy** from Deployments tab | `VERCEL=1` is automatic |
| Vercel (Web/Admin) | same, but only `VITE_API_URL` / `VITE_ORS_API_KEY` | rebuild required after change |

**Production cookie settings** (all apps on subdomains of one domain):

```env
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
ALLOWED_ORIGINS=https://app.<your-domain>,https://admin.<your-domain>,https://<your-domain>
```

---

## ✅ Post-rotation checklist

- [ ] `/health` returns `"database": "connected"`
- [ ] Fresh signup → OTP **email** arrives (Resend)
- [ ] Phone verification → **SMS** arrives (Twilio)
- [ ] Profile picture upload works (Cloudinary)
- [ ] Old admin password no longer signs in; new one does
- [ ] Old DB user deleted; old Resend/ORS/Cloudinary keys revoked
- [ ] Team members / the old company have **no** remaining access to dashboards

---

## 🧯 If a key leaks again

1. Revoke it at the provider **immediately** (rotation steps above).
2. Check provider usage dashboards for anomalies (Resend sends, Twilio SMS volume,
   Cloudinary bandwidth, Atlas connections).
3. `git log -p | grep <key-prefix>` to find when it entered the repo; the leak window
   starts from the first public exposure, not from when you noticed.
