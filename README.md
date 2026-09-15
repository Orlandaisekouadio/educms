# EduCMS — Educational Content Management System

Monorepo: `educms-backend/` (Express + PostgreSQL + Redis) and `educms-frontend/` (React + Vite + MUI).

## Local quickstart

```bash
# Backend
cd educms-backend
npm install
cp .env.example .env   # then set DB_PASSWORD and JWT secrets
PGPASSWORD=<pass> psql -h 127.0.0.1 -U postgres -d educms -f src/db/schema.sql
npm start              # http://localhost:5000, health: /api/health

# Frontend (new terminal)
cd educms-frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:5173
```

Seed logins: `admin@educms.com` / `admin123` (admin), `editor@educms.com` / `editor123` (editor), `author@educms.com` / `author123` (author).

## Deploy (Render)

1. Push this repo to GitHub (public).
2. Render Dashboard → New → Blueprint → select the repo (`render.yaml` defines backend + Postgres + Redis + frontend).
3. After deploy, set the two `sync: false` vars:
   - backend `FRONTEND_URL` = your frontend URL (e.g. `https://educms-frontend.onrender.com`)
   - frontend `VITE_API_URL` = your backend URL + `/api` (e.g. `https://educms-backend.onrender.com/api`), then redeploy the frontend.
4. Seed the production database once:
   ```bash
   psql <RENDER_POSTGRES_EXTERNAL_URL> -f educms-backend/src/db/schema.sql
   ```
   Get the external URL from the Render Postgres dashboard.

Note: `uploads/` is local disk and does not persist across Render deploys — fine for this checkpoint.
