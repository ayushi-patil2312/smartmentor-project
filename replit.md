# SmartMentor Project

Fullstack student/mentor dashboard.

## Stack
- **Frontend**: React 19 + Vite 8 + Tailwind v4 (`frontend/`)
- **Backend**: Flask + psycopg2 (`backend/app.py`)
- **Database**: Replit PostgreSQL (uses `DATABASE_URL`)

## Local Dev (Replit)
- `Backend` workflow runs Flask on `localhost:8000`
- `Start application` workflow runs Vite on `0.0.0.0:5000` with `allowedHosts: true`
- Vite proxies API paths (`/users`, `/goals`, `/login`, `/register`, `/feedbacks`, `/reports`, `/student`, `/mentor`, `/reset-password`) to the backend
- `frontend/src/api.js` uses `VITE_API_URL` (empty by default, so calls go relative through the proxy)

## Production (Autoscale Deployment)
- Build: `cd frontend && npm install && npm run build`
- Run: `cd backend && gunicorn --bind=0.0.0.0:5000 --reuse-port app:app`
- Flask serves the built `frontend/dist` as static files and falls back to `index.html` for SPA routing.

## Database
- Tables `users` and `goals` are auto-created on app startup via `init_db()`.
