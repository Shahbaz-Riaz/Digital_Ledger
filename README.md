# Ledger — MERN + TypeScript

A digital ledger book modeled on a traditional accountant's ledger: multiple
accounts in a sidebar, a ruled ledger page per account with running Dr/Cr
balances, and Print / PDF / CSV export.

## Stack

- **Backend**: Node, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, TypeScript, Vite (no UI framework — hand-styled to
  match the ledger-book design, using `EB Garamond` / `Playfair Display`)
- **Export**: `jspdf` + `jspdf-autotable` for client-side PDF, a plain CSV
  stream from the API, and `window.print()` with dedicated print CSS

## How balances work

Each account has an opening balance and a Dr/Cr type. Every entry stores a
`debit` or a `credit` (never both). On every create / edit / delete, the
server recomputes the account's entries in date order as one signed running
total (`+debit`, `-credit`) and persists each row's resulting `balance` and
`drOrCr`. Reads are then just a sorted find — no client-side math, and no
risk of the UI and database disagreeing on a balance.

## Project layout

```
docker-compose.yml         mongo + backend + frontend
backend/
  Dockerfile
  src/
    config/db.ts            MongoDB connection
    models/                 Account, Entry (Mongoose schemas)
    controllers/             account + entry request handlers
    routes/                  /api/accounts, /api/accounts/:id/entries
    utils/recalculateBalances.ts   the running-balance recompute
    middleware/errorHandler.ts     asyncHandler + centralized error responses
    index.ts                 app bootstrap
frontend/
  Dockerfile
  nginx.conf                serves the built app + proxies /api to backend
  src/
    api/client.ts            typed fetch wrapper for the API
    components/               Sidebar, LedgerBook, EntryRow, NewEntryRow
    utils/exportPdf.ts        client-side PDF export
    styles/ledger.css         the ledger-book design system
    App.tsx
```

## Running it with Docker Compose

This is the fastest path — no local Node or MongoDB install needed.

```bash
docker compose up --build
```

This starts three containers:

| Service    | What it is                              | Exposed at              |
|------------|-------------------------------------------|--------------------------|
| `mongo`    | MongoDB 7, with a named volume for data persistence | internal only        |
| `backend`  | Express API (built from `backend/Dockerfile`) | http://localhost:5000  |
| `frontend` | React app built and served by nginx, which also reverse-proxies `/api` to `backend` | http://localhost:5173  |

Open **http://localhost:5173** — the frontend talks to the API through
nginx's `/api` proxy, so there's no CORS or environment-variable wiring to
do. Data persists in the `mongo_data` volume across restarts; `docker
compose down -v` wipes it.

To rebuild after changing code: `docker compose up --build`. To run in the
background: `docker compose up --build -d`, then `docker compose logs -f`.

## Running it locally (without Docker)

### 1. MongoDB

Have a MongoDB instance available (local install, Docker, or Atlas) and note
its connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173, proxies /api to :5000
```

Open http://localhost:5173, create an account from the sidebar, and start
adding entries. (The frontend calls a relative `/api` path in both Docker
and local dev — Vite's dev server proxy and nginx's reverse proxy each
handle routing it to the backend, so no `VITE_API_URL` is needed unless you
want to point at a different backend host.)

## API

| Method | Path                                         | Purpose                  |
|--------|-----------------------------------------------|---------------------------|
| GET    | /api/accounts                                 | List accounts             |
| POST   | /api/accounts                                 | Create account             |
| PATCH  | /api/accounts/:id                             | Update account (name/opening balance) |
| DELETE | /api/accounts/:id                             | Delete account + its entries |
| GET    | /api/accounts/:accountId/entries              | List entries for an account |
| POST   | /api/accounts/:accountId/entries              | Add an entry               |
| PATCH  | /api/accounts/:accountId/entries/:entryId     | Edit an entry               |
| DELETE | /api/accounts/:accountId/entries/:entryId     | Delete an entry             |
| GET    | /api/accounts/:accountId/entries/export/csv   | Download the ledger as CSV |

## Using the app

- **Add an entry**: fill in the blank row at the bottom of the table and
  press Enter or the ＋ button.
- **Edit an entry**: double-click a row.
- **Delete**: hover a row and click the ✕ that appears on the right.
- **Print**: the toolbar's Print button opens the browser print dialog with
  the sidebar and toolbar hidden, leaving just the ledger page.
- **Export PDF / CSV**: toolbar buttons generate a PDF client-side or
  download a CSV from the API.

## Notes on scope

This was built to match the brief — real CRUD, real persisted balances, and
working exports — without extra layers (no state-management library, no ORM
abstraction beyond Mongoose, no auth) since none of that was asked for.
Auth, multi-user support, and entry reordering (drag-and-drop) would be the
natural next additions if the app grows beyond a single bookkeeper's desktop.
