# Deploy izzmarket

## What your “backend” is

| Piece | Technology |
|--------|------------|
| API server | **Node.js + Express** (`server.js`, `backend/app.js`) |
| Database | **MongoDB Atlas** (`MONGO_URI` in env) |
| Auth | **JWT** in httpOnly cookies |
| Payments | **Stripe** |
| AI SEO | **Groq** (and optional Cerebras) |
| Images | Local folder `backend/uploads` (fine on Render; **not persistent** on Vercel serverless) |

Locally: `npm run dev` → React :3000 + API :4000.  
Production (one server): `NODE_ENV=production node server.js` serves API + `frontend/build`.

---

## Option A — Render (recommended for full app)

1. Push code to GitHub.
2. [render.com](https://render.com) → **New** → **Blueprint** (or Web Service).
3. Connect repo `Ecom-Sem-Project`.
4. **Environment variables** (same as `backend/.env`, never commit `.env`):
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET`, `JWT_EXPIRE`, `COOKIE_EXPIRE`
   - `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
   - `GROQ_API_KEY`
5. **MongoDB Atlas** → Network Access → allow **0.0.0.0/0** (or Render’s IPs).
6. Build: `npm install && npm run render-postbuild`  
   Start: `NODE_ENV=production node server.js`

Your site URL will be like `https://izzmarket.onrender.com` — shop + API on one domain.

---

## Option B — Vercel (after fixing config)

The repo includes `api/index.js` + `vercel.json` so Vercel runs Express as a serverless function and serves the React build.

1. **Push** latest code (with `api/index.js` and updated `vercel.json`).
2. Vercel → **Settings → Environment Variables** — add every variable from `backend/.env` (Production).
3. Atlas → **Network Access** → `0.0.0.0/0`.
4. **Redeploy** (Deployments → … → Redeploy).
5. Check:
   - `https://your-app.vercel.app/api/health` → should show `"db": "connected"`
   - `https://your-app.vercel.app/` → React storefront

If you still see **Not Found**:

- Old `vercel.json` used only `server.js` with `app.listen()` — that does not work on Vercel.
- Ensure **Build Command** runs the frontend build (see `vercel.json` `buildCommand`).
- Open **Deployment → Build logs** and confirm `frontend/build` was created.

---

## Vercel vs Render

| | Vercel | Render |
|---|--------|--------|
| Express `listen()` | No — use `api/index.js` | Yes — `server.js` |
| MongoDB | Yes (env vars) | Yes |
| File uploads | Ephemeral / limited | Persistent disk on web service |
| Easiest for this repo | Needs env + redeploy | **Simplest** (`render.yaml`) |

---

## After deploy

- Register / login only works if `MONGO_URI` is set and Atlas allows the host IP.
- Set `REACT_APP_SITE_URL` to your public URL (e.g. `https://izzmarket.onrender.com`) for SEO canonical links.
