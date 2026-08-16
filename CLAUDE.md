# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A healthcare web app ("Nexora") with role-based dashboards (admin/doctor/patient): vitals tracking,
prescription OCR, medical report analysis, drug interaction checking, an AI chatbot with crisis
detection, medicine lookup, and hospital/appointment search. Node/Express + PostgreSQL backend,
React + Vite frontend.

`ai-services/`, `database/`, `docs/`, and `infra/` at the repo root are empty scaffolding
(`.gitkeep` only) — no code lives there yet. All real backend logic lives under `backend/src`.

## Commands

Run from repo root (uses `concurrently` to run both):
```
npm run dev              # backend (nodemon, :5000) + frontend (vite, :5173)
```

Backend (`backend/`):
```
npm run dev               # nodemon, auto-frees the port first (scripts/free-port.js), then runs src/server.js
npm start                 # plain node src/server.js
node scripts/seedDemoData.js   # seeds demo hospitals/doctors (needs DATABASE_URL set)
```

Frontend (`frontend/`):
```
npm run dev                # vite dev, :5173
npm run build               # vite build
npm run lint                 # eslint (only covers **/*.{ts,tsx})
npm run format               # prettier --write .
```

There is no test suite in this repo currently.

### Environment

Both `backend/.env` and `frontend/.env` are required (see the adjacent `.env.example` for the
full list). Backend needs at minimum `DATABASE_URL` (Postgres) and `JWT_SECRET`. Everything else
(Azure Vision, OCR.space, OpenAI/Groq, email/SMTP) is optional — each integration has an
`isConfigured()` check and the app degrades gracefully (see below) when a key is missing.

## Backend architecture (`backend/src`)

Standard layered structure: `routes/` → `controllers/` → `models/` (Sequelize), with shared logic
in `utils/` and static reference datasets in `data/`.

- **`server.js`** is the composition root: it `require()`s every model directly (for side-effect
  table registration) before mounting routes, then calls `sequelize.sync({ alter: true })` on
  startup instead of running migrations. This is dev-only — `{ alter: true }` will silently modify
  existing tables. If you add a model, `require` it in `server.js` or it won't get a table.
- **Auth** (`middleware/authMiddleware.js`): `verifyToken` decodes the Bearer JWT into
  `req.user = { id, role }`; `requireRole(...roles)` gates by role. Every protected route composes
  both, e.g. `router.get("/patient/:patientId", verifyToken, requireRole("doctor", "admin"), ...)`.
  Roles are exactly `admin | doctor | patient` (enum on the `User` model).
- **External services live in `config/`, one file per provider, each exporting `isConfigured()`**
  so callers can fail over without throwing. Two multi-provider fallback chains to know about:
  - OCR (`utils/ocrEngine.js`): Azure Vision → OCR.space → Tesseract.js (always available, no key
    needed, printed text only — Azure/OCR.space are needed for handwriting).
  - Chat (`config/openaiClient.js`): OpenAI → Groq, same system prompt either way, controlled by
    `CHAT_PROVIDER=openai|groq|auto` (default `auto`).
  - `utils/crisisDetector.js` runs on chatbot input *before* the LLM call and short-circuits with a
    hardcoded emergency/self-harm response (India-specific helplines) when it matches — this is
    intentionally regex-based and independent of the LLM provider.
- **`data/`** (`medicineDatabase.js`, `drugInteractions.js`, `labReferenceRanges.js`) are static
  in-repo datasets used by `drugInteractionChecker.js` and `reportAnalyzer.js` for name/interaction
  lookups — there's no external drug API call in the current implementation.
- **Uploads**: `config/upload.js` builds per-feature multer instances (`createUploader(subfolder)`)
  writing to `backend/uploads/<subfolder>/`; files are served back at `/uploads/...` via
  `express.static` — noted in `server.js` as dev-only (swap for signed URLs before production).

## Frontend architecture (`frontend/src`)

**Two coexisting route systems exist in this folder — only one is actually wired up.**

- **The real app**: `index.html` → `main.jsx` → `App.jsx`. Uses `react-router-dom`
  (`BrowserRouter`), hand-written pages in `pages/<role>/...`, role-gated with
  `components/common/ProtectedRoute.jsx` + `context/AuthContext.jsx` (JWT in `localStorage`,
  attached to requests via the axios instance in `services/api.js`). Routes: `/login`, `/register`,
  `/forgot-password`, `/reset-password`, and role dashboards at `/admin`, `/doctor`, `/patient`.
  Active Vite config is **`vite.config.js`** (plain `@vitejs/plugin-react`, port 5173).
- **Unused scaffold**: `routes/`, `router.tsx`, `routeTree.gen.ts`, `server.ts`, `start.ts`,
  `vite.config.ts`, `lib/nexora.ts`, and `components.json` are a TanStack Start + shadcn/ui +
  Lovable.dev (`@lovable.dev/mcp-js`) template that was scaffolded but never wired in — `npm run
  dev` loads `vite.config.js`, not `vite.config.ts`. Don't add features there by default; if asked
  to migrate the app onto TanStack Start, treat that as an explicit, separate task.
- Despite the scaffold being unused, `components/ui/*` (shadcn/Radix primitives) and Tailwind are
  genuinely used by the real app's pages — those are shared, not scaffold-only.
- `services/*.js` wrap `services/api.js` (axios) per feature (auth, vitals, prescriptions,
  medical reports, drug interactions, chat, medicine info, appointments) and are the layer
  components call into — controllers/routes on the backend map roughly 1:1 to these.
- Backend origin for API calls comes from `VITE_API_URL` (defaults to `http://localhost:5000/api`).
