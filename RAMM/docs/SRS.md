# Software Requirements Specification (SRS)

## RAMMS — Roads Authority Management & Monitoring System

**Version:** 1.0  
**Date:** June 2025  
**Prepared for:** Namibian Roads Authority (NRA)  
**Document Status:** Final Draft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Design](#6-database-design)
7. [API Specification](#7-api-specification)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Security Requirements](#9-security-requirements)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Appendices](#11-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for the Roads Authority Management & Monitoring System (RAMMS), a web-based application designed to manage, monitor, and maintain Namibia's road infrastructure assets including roads, bridges, culverts, signage, guardrails, and traffic signals.

### 1.2 Scope

RAMMS provides the Namibian Roads Authority with:
- Real-time geospatial visualization of all road infrastructure assets
- Condition monitoring through scheduled and emergency inspections
- Work order management for maintenance and repairs
- Budget tracking and cost management
- Role-based access control for administrators, inspectors, contractors, and viewers
- Approval workflows for assets, inspections, and work orders

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| NRA | Namibian Roads Authority |
| RAMMS | Roads Authority Management & Monitoring System |
| Asset | Any physical road infrastructure element (road, bridge, culvert, sign, guardrail, traffic light) |
| Inspection | A scheduled or emergency assessment of an asset's condition |
| Work Order | An authorized task for maintenance, repair, or replacement of an asset |
| NAD | Namibian Dollar (currency) |
| GIS | Geographic Information System |

### 1.4 References

- Namibian Roads Authority Act, 1999 (Act No. 17 of 1999)
- ISO 55000:2014 Asset Management
- SANS 1200 Road Construction Standards
- IEEE 830-1998 Recommended Practice for SRS

---

## 2. Overall Description

### 2.1 Product Perspective

RAMMS is a standalone web application that replaces manual paper-based asset tracking and maintenance scheduling used by the NRA. It integrates:
- Geospatial mapping (OpenStreetMap/Leaflet)
- Serverless PostgreSQL database (Neon)
- Modern single-page application (React)
- RESTful API backend (Hono/Node.js)

### 2.2 Product Functions

| Function | Description |
|----------|-------------|
| Asset Management | Register, track, approve, and monitor infrastructure assets |
| Geospatial Visualization | Interactive map showing all assets with condition color-coding |
| Inspection Management | Schedule, conduct, and approve condition inspections |
| Work Order Management | Create, assign, track, and complete maintenance work |
| Dashboard & Analytics | Overview statistics, alerts, and activity feeds |
| User & Role Management | Authentication, authorization, and role-based access |
| Budget Tracking | Estimate costs, track actual expenditure by work order |
| Approval Workflows | Multi-stage approval for assets, inspections, and work orders |

### 2.3 User Classes and Characteristics

| User Role | Description | Permissions |
|-----------|-------------|-------------|
| **Admin** | NRA management staff | Full access: create, edit, delete, approve all resources |
| **Inspector** | Field inspection staff | Create inspections, view assets, submit for approval |
| **Contractor** | External maintenance firms | View assigned work orders, update progress, submit completion |
| **Viewer** | General stakeholders | Read-only access to dashboard, map, and public data |

### 2.4 Operating Environment

- **Client:** Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server:** Node.js 18+ runtime
- **Database:** PostgreSQL 15+ (Neon serverless)
- **Hosting:** Any Node.js-compatible platform (Vercel, Railway, Fly.io, AWS)
- **Network:** HTTPS required; minimum 1 Mbps connection for map tiles

### 2.5 Assumptions and Dependencies

- Users have internet access to reach the application
- GPS coordinates for assets are available (manual entry or mobile GPS)
- OpenStreetMap tile servers remain publicly available
- Neon PostgreSQL service maintains 99.9% uptime SLA

---

## 3. System Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                       │
│  React 18 + React Router 7 + TanStack Query + Leaflet   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────┐
│                   Application Server                      │
│         Hono Framework + React Router SSR                 │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Middleware   │  │ API Routes   │  │ SSR Renderer  │  │
│  │ Stack        │  │ /api/*       │  │ React Pages   │  │
│  └─────────────┘  └──────┬───────┘  └───────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ SQL over HTTP
┌──────────────────────────▼──────────────────────────────┐
│              Neon Serverless PostgreSQL                   │
│        (Connection pooling via HTTP driver)              │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.2 |
| Routing/SSR | React Router | 7.6.0 |
| HTTP Framework | Hono | 4.7.9 |
| Data Fetching | TanStack React Query | 5.x |
| Mapping | Leaflet + react-leaflet | 1.9.4 / 4.2 |
| Database | PostgreSQL (Neon) | 15+ |
| DB Driver | @neondatabase/serverless | 1.x |
| Authentication | @auth/core | Credentials provider |
| Password Hashing | argon2 | — |
| Build Tool | Vite | 6.x |
| Package Manager | Bun | 1.3+ |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | — |

### 3.3 Middleware Stack

Applied in order on every request:

1. **Request Logger** — logs method, path, status, duration with trace IDs
2. **Security Headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
3. **Rate Limiting** — 100 requests/minute per IP on `/api/*`
4. **Content-Type Validation** — rejects POST/PUT/PATCH without proper Content-Type
5. **Auth Guard** — JWT validation on mutation requests (POST/PUT/PATCH/DELETE); GET requests are public

---

## 4. Functional Requirements

### 4.1 Asset Management (FR-AM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AM-01 | System shall register new assets with ID, name, type, location, description | Must |
| FR-AM-02 | System shall record GPS coordinates (latitude/longitude) for each asset | Must |
| FR-AM-03 | System shall support asset types: Road, Bridge, Culvert, Sign, Guardrail, Traffic Light | Must |
| FR-AM-04 | System shall track condition rating (1-5 scale) for each asset | Must |
| FR-AM-05 | System shall maintain construction date and last maintenance date | Should |
| FR-AM-06 | System shall support asset statuses: active, inactive, decommissioned | Must |
| FR-AM-07 | System shall implement approval workflow: pending → approved/rejected | Must |
| FR-AM-08 | System shall generate unique asset IDs (format: TYPE-REGION-NUMBER) | Should |
| FR-AM-09 | System shall store metadata and photos (JSON) per asset | Could |
| FR-AM-10 | System shall calculate maintenance due based on interval_months | Could |

### 4.2 Geospatial Map (FR-MAP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MAP-01 | System shall display all approved active assets on an interactive map | Must |
| FR-MAP-02 | Map shall be centered on Namibia (lat: -22.9576, lng: 18.4904) | Must |
| FR-MAP-03 | Assets shall be color-coded by condition: green (4-5), amber (3), red (1-2) | Must |
| FR-MAP-04 | Clicking a marker shall show a popup with asset details | Must |
| FR-MAP-05 | System shall provide search functionality to find assets by name/ID/address | Must |
| FR-MAP-06 | System shall allow filtering by asset type | Must |
| FR-MAP-07 | System shall allow filtering by condition rating | Must |
| FR-MAP-08 | Map shall display zoom controls and attribution | Must |
| FR-MAP-09 | Map shall use OpenStreetMap tiles (no API key required) | Must |
| FR-MAP-10 | System shall fly to asset location when selected from another view | Should |

### 4.3 Inspection Management (FR-INS)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-INS-01 | System shall create inspection records linked to specific assets | Must |
| FR-INS-02 | Inspections shall record: condition rating, findings, recommendations | Must |
| FR-INS-03 | System shall support inspection types: routine, emergency, follow_up, initial | Must |
| FR-INS-04 | System shall implement approval workflow: pending → submitted → approved/rejected | Must |
| FR-INS-05 | System shall record inspector identity and inspection date | Must |
| FR-INS-06 | System shall record GPS location and weather conditions | Should |
| FR-INS-07 | System shall support photo attachments per inspection | Could |
| FR-INS-08 | System shall update asset condition_rating based on latest approved inspection | Should |
| FR-INS-09 | System shall generate unique inspection IDs (format: INS-YYYY-NNN) | Must |

### 4.4 Work Order Management (FR-WO)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-WO-01 | System shall create work orders linked to assets (optionally to inspections) | Must |
| FR-WO-02 | Work orders shall specify: title, description, work_type, priority | Must |
| FR-WO-03 | System shall support priorities: low, medium, high, critical | Must |
| FR-WO-04 | System shall track estimated_cost and actual_cost in NAD | Must |
| FR-WO-05 | System shall implement status flow: pending → approved → assigned → in_progress → completed/cancelled | Must |
| FR-WO-06 | System shall assign contractors and track assignment date | Must |
| FR-WO-07 | System shall record scheduled and completion dates | Must |
| FR-WO-08 | System shall support completion photos and notes | Could |
| FR-WO-09 | System shall generate unique work order IDs (format: WO-YYYY-NNN) | Must |

### 4.5 Dashboard & Analytics (FR-DASH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | Dashboard shall show total asset count with "need attention" count | Must |
| FR-DASH-02 | Dashboard shall show pending inspections count | Must |
| FR-DASH-03 | Dashboard shall show active work orders and pending approvals | Must |
| FR-DASH-04 | Dashboard shall show total budget (sum of estimated_cost) and spent (sum of actual_cost) | Must |
| FR-DASH-05 | Dashboard shall show asset overview grouped by type with average condition | Must |
| FR-DASH-06 | Dashboard shall show recent activity feed (latest work orders) | Must |
| FR-DASH-07 | Dashboard shall show pending approval queue with count | Should |
| FR-DASH-08 | Dashboard shall auto-refresh every 30 seconds | Should |

### 4.6 Authentication & Authorization (FR-AUTH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | System shall provide email/password registration (sign-up) | Must |
| FR-AUTH-02 | System shall provide email/password login (sign-in) | Must |
| FR-AUTH-03 | Passwords shall be hashed with argon2 before storage | Must |
| FR-AUTH-04 | System shall issue JWT session tokens upon successful login | Must |
| FR-AUTH-05 | GET requests shall be publicly accessible (read without login) | Must |
| FR-AUTH-06 | Mutation requests (POST/PUT/DELETE) shall require valid JWT | Must |
| FR-AUTH-07 | System shall support roles: admin, inspector, contractor, viewer | Must |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | Page initial load time | < 3 seconds |
| NFR-PERF-02 | API response time (simple queries) | < 500ms |
| NFR-PERF-03 | Map tile loading | < 2 seconds per viewport |
| NFR-PERF-04 | Dashboard data refresh | < 1 second |
| NFR-PERF-05 | Concurrent users supported | 100+ |

### 5.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-01 | System uptime | 99.5% monthly |
| NFR-REL-02 | Data backup frequency | Daily automated |
| NFR-REL-03 | Recovery Point Objective (RPO) | 24 hours |
| NFR-REL-04 | Recovery Time Objective (RTO) | 4 hours |

### 5.3 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-01 | Assets supported | 100,000+ |
| NFR-SCALE-02 | Inspections stored | 1,000,000+ |
| NFR-SCALE-03 | Work orders | 500,000+ |
| NFR-SCALE-04 | Database autoscaling | Via Neon serverless |

### 5.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | Responsive design (desktop, tablet, mobile) |
| NFR-USE-02 | Dark mode support |
| NFR-USE-03 | Accessible navigation (keyboard-navigable sidebar) |
| NFR-USE-04 | Consistent UI patterns across all views |
| NFR-USE-05 | Loading states for all async operations |

### 5.5 Security

See Section 9 for detailed security requirements.

---

## 6. Database Design

### 6.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  auth_users  │       │    users     │       │ asset_types  │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │       │ name         │
│ email        │       │ email        │       │ description  │
│ password     │       │ role         │       │ icon         │
│ created_at   │       │ organization │       │ color        │
└──────────────┘       │ phone        │       └──────┬───────┘
                       │ is_active    │              │
                       └──────┬───────┘              │
                              │                      │
            ┌─────────────────┼──────────────────────┤
            │                 │                      │
┌───────────▼──┐    ┌────────▼───────┐    ┌────────▼───────┐
│ inspections  │    │    assets      │    │  work_orders   │
│──────────────│    │────────────────│    │────────────────│
│ id (PK)      │    │ id (PK)        │    │ id (PK)        │
│ inspection_id│    │ asset_id       │    │ work_order_id  │
│ asset_id (FK)│◄──►│ name           │◄──►│ asset_id (FK)  │
│ inspector_id │    │ asset_type_id  │    │ inspection_id  │
│ condition    │    │ longitude      │    │ title          │
│ findings     │    │ latitude       │    │ priority       │
│ status       │    │ condition      │    │ estimated_cost │
│ created_at   │    │ status         │    │ status         │
└──────────────┘    │ approval_status│    └────────────────┘
                    └────────────────┘
```

### 6.2 Tables

| Table | Purpose | Records (Demo) |
|-------|---------|----------------|
| auth_users | Authentication credentials | — |
| auth_accounts | OAuth/credentials provider links | — |
| users | Application user profiles and roles | 3 |
| asset_types | Asset classification lookup | 6 |
| assets | Physical infrastructure records | 15 |
| inspections | Condition assessment records | 7 |
| work_orders | Maintenance task records | 7 |

---

## 7. API Specification

### 7.1 Base URL

```
https://<domain>/api/
```

### 7.2 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/asset-types` | No | List all asset types |
| GET | `/api/assets` | No | List assets (supports ?type=&condition= filters) |
| GET | `/api/assets/:id` | No | Get single asset details |
| POST | `/api/assets` | Yes | Create new asset |
| PUT | `/api/assets/:id` | Yes | Update asset |
| DELETE | `/api/assets/:id` | Yes | Delete asset |
| GET | `/api/inspections` | No | List inspections |
| POST | `/api/inspections` | Yes | Create inspection |
| GET | `/api/work-orders` | No | List work orders |
| POST | `/api/work-orders` | Yes | Create work order |
| GET | `/api/dashboard/stats` | No | Dashboard statistics |
| GET | `/api/reports` | No | Asset condition reports |
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/callback/credentials` | No | Sign in |
| GET | `/api/auth/session` | No | Get current session |

### 7.3 Response Format

All API responses return JSON:

```json
// Success (list)
[{ "id": "uuid", "name": "..." }, ...]

// Success (single)
{ "id": "uuid", "name": "..." }

// Error
{ "error": "Error message description" }
```

### 7.4 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid JWT) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 8. User Interface Requirements

### 8.1 Navigation

- Collapsible icon sidebar with: Dashboard, Map View, Assets, Inspections, Work Orders, Settings
- Page header with title and notification badge
- Keyboard-accessible navigation (aria-labels on all buttons)

### 8.2 Views

| View | Route | Content |
|------|-------|---------|
| Dashboard | `/` | Stats cards, asset overview, recent activity, approval queue |
| Map View | `/` (tab: map) | Interactive Leaflet map, search, filters, markers, legend |
| Assets List | `/` (tab: assets) | Table of all assets with condition badges |
| Inspections | `/` (tab: inspections) | Table of inspections with status filters |
| Work Orders | `/` (tab: work-orders) | Table of work orders with priority/status |
| Sign In | `/account/signin` | Email + password login form |
| Sign Up | `/account/signup` | Registration form (name, email, password) |

### 8.3 Design System

- **Colors:** Blue primary (#0062FF), dark mode support
- **Typography:** Inter font family
- **Cards:** Rounded corners (xl), subtle shadow, white/dark backgrounds
- **Icons:** Lucide React icon set
- **Condition Colors:** Green (#10B981) = Excellent, Amber (#F59E0B) = Good, Red (#EF4444) = Poor

---

## 9. Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-01 | All passwords hashed with argon2 (memory-hard algorithm) |
| SEC-02 | JWT tokens for session management (short-lived) |
| SEC-03 | HTTPS required for all connections |
| SEC-04 | X-Content-Type-Options: nosniff header on all responses |
| SEC-05 | X-Frame-Options: SAMEORIGIN to prevent clickjacking |
| SEC-06 | X-XSS-Protection: 1; mode=block |
| SEC-07 | Referrer-Policy: strict-origin-when-cross-origin |
| SEC-08 | Rate limiting: 100 requests/minute per IP |
| SEC-09 | Content-Type validation on mutation requests |
| SEC-10 | SQL injection prevention via parameterized queries (Neon tagged templates) |
| SEC-11 | Database connection via SSL (sslmode=require) |
| SEC-12 | No secrets stored in source code; environment variables only |

---

## 10. Deployment & Infrastructure

### 10.1 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| DATABASE_URL | Neon PostgreSQL connection string | Yes |
| AUTH_SECRET | JWT signing secret | Yes |
| PORT | Server port (default: 4000) | No |

### 10.2 Build & Run

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### 10.3 Database Setup

```bash
# Run schema migrations
bun run seed-demo-data.mjs

# Or apply schema directly
psql $DATABASE_URL -f schema.sql
```

---

## 11. Appendices

### 11.1 Asset Condition Rating Scale

| Rating | Description | Action Required |
|--------|-------------|-----------------|
| 5 | Excellent — New or recently maintained | Routine monitoring only |
| 4 | Very Good — Minor wear, fully functional | Schedule preventive maintenance |
| 3 | Good — Moderate wear, minor defects | Plan maintenance within 6 months |
| 2 | Fair — Significant deterioration | Urgent repair needed within 3 months |
| 1 | Poor — Critical condition, safety risk | Emergency intervention required |

### 11.2 Work Order Priority Matrix

| Priority | Response Time | Description |
|----------|--------------|-------------|
| Critical | 24-48 hours | Safety hazard, road closure risk |
| High | 1-2 weeks | Significant deterioration, rapid worsening |
| Medium | 1-3 months | Standard maintenance, planned repair |
| Low | 3-6 months | Preventive, cosmetic, or minor issues |

### 11.3 Namibian Road Network Context

- Total road network: ~48,000 km
- Paved roads: ~7,000 km
- Major routes: B1 (North-South), B2 (Windhoek-Swakopmund), B6 (Airport Road)
- Currency: Namibian Dollar (NAD), 1 NAD ≈ 1 ZAR
- Primary authority: Roads Authority (RA) established 2000

---

*End of Document*
