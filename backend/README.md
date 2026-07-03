# SOL Training Academy — Backend

Node.js + Express + MongoDB (Mongoose) REST API for the SOL Training Academy LMS.
Supports the **Student Dashboard** and **LMS Admin Dashboard**. JavaScript (ES Modules) only.

## Tech Stack
- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express 4
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT (access + refresh) + bcrypt, RBAC (`student`, `admin`, `team_member`)
- **Payments:** Stripe (Checkout + Webhooks)
- **Files/PDFs:** Cloudinary + PDFKit
- **Security:** Helmet, CORS, rate limiting, HPP, Mongo sanitization, XSS filtering

## Local Setup
```bash
cd backend
cp .env.example .env      # then fill in real values
npm install
npm run dev               # nodemon on http://localhost:5000
```
Health check: `GET http://localhost:5000/api/v1/health`

## Scripts
| Script | Purpose |
|--------|---------|
| `npm start` | Production start (`node src/server.js`) |
| `npm run dev` | Dev with autoreload (nodemon) |
| `npm run seed:admin` | Create the initial admin user from `SEED_ADMIN_*` env vars |

## Project Structure
```
backend/
├── src/
│   ├── config/       env + db connection
│   ├── controllers/  request handlers
│   ├── routes/       express routers (versioned under /api/v1)
│   ├── models/       mongoose schemas
│   ├── middleware/   auth, security, error handling, rate limiting
│   ├── services/     business logic (stripe, enrollment, etc.)
│   ├── validators/   input validation
│   ├── utils/        ApiError, ApiResponse, asyncHandler, logger
│   ├── helpers/      shared helpers (pagination, query builders)
│   ├── cloudinary/   cloudinary config + upload helpers
│   ├── stripe/       stripe client + checkout/webhook logic
│   ├── pdf/          certificate & invoice PDF generation
│   ├── app.js        express app assembly
│   └── server.js     entrypoint (db connect + http listen)
└── uploads/          temp local upload staging (gitignored)
```

## Deployment
### Render (recommended)
- Uses `render.yaml` blueprint (rootDir `backend`, health check `/api/v1/health`).
- Set all `sync:false` secrets in the Render dashboard.
- Stripe webhook endpoint: `https://<your-service>.onrender.com/api/v1/webhooks/stripe`

### Railway
- New Project → Deploy from repo → set **Root Directory** = `backend`.
- Start command: `npm start`. Add the same env vars from `.env.example`.

## API Versioning
All endpoints are served under `/api/v1`.
