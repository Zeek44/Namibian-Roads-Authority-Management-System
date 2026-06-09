# Namibian Roads Authority Management System (RAMMS)

A full-stack web application for managing road infrastructure assets, inspections, and work orders for the Namibian Roads Authority.

## Tech Stack

- **Frontend**: React 18 + React Router v7 + Tailwind CSS + Chakra UI
- **Backend**: Hono (on Node.js) + React Router Hono Server
- **Database**: Neon (Serverless PostgreSQL)
- **Auth**: Auth.js with JWT strategy + Credentials provider (argon2 hashing)
- **Build**: Vite + TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- A Neon PostgreSQL database (or compatible Postgres)

### Installation

```bash
bun install
```

### Environment Variables

Copy `.env.example` to `.env` and set the required values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `AUTH_SECRET` - Secret for JWT signing
- `AUTH_URL` - Base URL for auth (e.g., `http://localhost:4000`)

### Development

```bash
bun run dev
```

The app runs on `http://localhost:4000` by default.

## Project Structure

```
├── __create/              # Hono server entry & configuration
│   ├── index.ts           # Server entry point with middleware
│   ├── adapter.ts         # Neon Auth adapter
│   ├── route-builder.ts   # API route auto-discovery
│   └── ...
├── src/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   │   ├── assets/    # Asset CRUD
│   │   │   ├── inspections/ # Inspection CRUD + approval
│   │   │   ├── work-orders/ # Work order CRUD
│   │   │   ├── reports/   # Report generation
│   │   │   ├── dashboard/ # Dashboard statistics
│   │   │   └── auth/      # Authentication endpoints
│   │   ├── page.jsx       # Home page
│   │   └── routes.ts      # File-system route discovery
│   ├── components/        # React UI components
│   ├── middleware/         # Custom Hono middleware
│   │   ├── auth.ts        # JWT authentication guard
│   │   ├── logger.ts      # Request logging
│   │   ├── rateLimit.ts   # Rate limiting
│   │   ├── securityHeaders.ts # Security headers
│   │   └── validation.ts  # Content-type validation
│   └── utils/             # Client-side utilities
├── plugins/               # Vite plugins
└── mobile/                # React Native mobile app
```

## Middleware

The following middleware is applied to all API routes:

1. **Request Logger** - Logs method, path, status, and duration
2. **Security Headers** - Adds X-Content-Type-Options, X-Frame-Options, etc.
3. **Rate Limiting** - 100 requests/minute per IP on API routes
4. **Content-Type Validation** - Validates POST/PUT/PATCH have proper Content-Type
5. **Auth Guard** - JWT-based authentication for protected API routes

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assets` | List assets (filterable) |
| POST | `/api/assets` | Create an asset |
| GET | `/api/assets/:id` | Get asset by ID |
| GET | `/api/inspections` | List inspections (filterable) |
| POST | `/api/inspections` | Create an inspection |
| POST | `/api/inspections/:id/approve` | Approve an inspection |
| GET | `/api/work-orders` | List work orders (filterable) |
| POST | `/api/work-orders` | Create a work order |
| GET | `/api/reports` | Generate reports (various types) |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/asset-types` | List asset types |
