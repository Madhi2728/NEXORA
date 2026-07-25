# AI Healthcare Ecosystem

See `ROADMAP.md` for the full architecture and build order.

## ✅ Module 1 complete: Auth & Role-Based Login

**What's built:**
- Node/Express backend with PostgreSQL (Sequelize) `users` table (`admin` / `doctor` / `patient` roles)
- JWT auth: register, login, `/me`, and admin-only staff creation
- Role-based access-control middleware (`verifyToken`, `requireRole`)
- React frontend: Login & Register pages, `AuthContext`, `ProtectedRoute`, and three
  role-based dashboard shells (`/admin`, `/doctor`, `/patient`) that redirect based on role

## Run it locally

### Backend
```bash
cd backend
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npm install
npm run dev                # starts on http://localhost:5000
```
Requires a running PostgreSQL instance matching `DATABASE_URL`. The `users` table is
auto-created on first run via `sequelize.sync()`.

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

### Try it
1. Go to `http://localhost:5173/register`, create a **patient** or **doctor** account.
2. You'll be redirected to the matching dashboard.
3. To test admin: register a normal account, then manually update its `role` to `admin`
   in the database (self-registration as admin is intentionally blocked) — or use the
   `POST /api/auth/create-staff` endpoint from an existing admin account.

## Next module
Health Dashboard (vitals, activity, history) — builds on this auth layer.
