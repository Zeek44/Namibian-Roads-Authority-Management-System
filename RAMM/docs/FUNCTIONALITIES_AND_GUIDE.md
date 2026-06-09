# RAMMS — Functionalities & User Guide

## Roads Authority Management & Monitoring System

**Version:** 1.0 | **Last Updated:** June 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [Map View](#4-map-view)
5. [Asset Management](#5-asset-management)
6. [Inspections](#6-inspections)
7. [Work Orders](#7-work-orders)
8. [Authentication](#8-authentication)
9. [API Reference](#9-api-reference)
10. [Administration Guide](#10-administration-guide)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

### What is RAMMS?

RAMMS is a web-based management system for tracking and maintaining Namibia's road infrastructure. It provides:

- **Interactive Map** — See all assets plotted on a map of Namibia with condition color-coding
- **Asset Registry** — Track roads, bridges, culverts, signs, guardrails, and traffic lights
- **Inspection Management** — Record and approve field inspections
- **Work Order Tracking** — Manage maintenance jobs from request to completion
- **Dashboard Analytics** — Real-time overview of system health and pending actions

### Key Features at a Glance

| Feature | Description |
|---------|-------------|
| 🗺️ Interactive Map | OpenStreetMap-powered map showing all assets |
| 📊 Dashboard | Real-time statistics and activity feed |
| 🔍 Search & Filter | Find assets by name, ID, type, or condition |
| 📋 Inspections | Create, submit, and approve condition assessments |
| 🔧 Work Orders | Track maintenance from assignment to completion |
| 🔐 Role-Based Access | Admin, Inspector, Contractor, Viewer roles |
| 📱 Responsive | Works on desktop, tablet, and mobile |
| 🌙 Dark Mode | Full dark theme support |

---

## 2. Getting Started

### 2.1 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- A **PostgreSQL database** (Neon recommended)
- A modern web browser

### 2.2 Installation

```bash
# Clone the repository
git clone https://github.com/Zeek44/tk.git
cd tk

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 2.3 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
AUTH_SECRET=your-random-secret-string-here
```

### 2.4 Database Setup

```bash
# Apply the schema (creates all tables)
psql $DATABASE_URL -f schema.sql

# Seed demo data (optional)
bun run seed-demo-data.mjs
```

### 2.5 Running the Application

```bash
# Development mode (with hot reload)
bun run dev

# Production build
bun run build
bun run start
```

The app will be available at **http://localhost:4000**

---

## 3. Dashboard

### 3.1 Overview

The dashboard is the landing page showing a high-level summary of the system.

### 3.2 Statistics Cards

| Card | Description |
|------|-------------|
| **Total Assets** | Count of all registered assets + how many need attention (condition ≤ 2) |
| **Pending Inspections** | Inspections in "pending" or "submitted" status |
| **Active Work Orders** | Work orders currently "in_progress" + pending approval count |
| **Budget Status** | Total estimated cost of all work orders + total actual cost spent |

### 3.3 Approval Queue Banner

When items are awaiting approval, a yellow banner shows:
- Count of pending assets, inspections, and work orders
- "Review Queue" button (for admin users)

### 3.4 Asset Overview by Type

A breakdown showing:
- Asset type name (Road, Bridge, etc.)
- Count of assets per type
- Average condition rating
- Number in "poor" condition (rating ≤ 2)

### 3.5 Recent Activity

The 5 most recent work orders with:
- Work order ID
- Associated asset name
- Current status (color-coded badge)
- Date

### 3.6 Auto-Refresh

Dashboard data automatically refreshes every 30 seconds without page reload.

---

## 4. Map View

### 4.1 Overview

The interactive map displays all **approved, active** assets on an OpenStreetMap base layer, centered on Namibia.

### 4.2 Map Controls

| Control | Location | Function |
|---------|----------|----------|
| Zoom In (+) | Top-left | Zoom into the map |
| Zoom Out (−) | Top-left | Zoom out of the map |
| Mouse Scroll | Anywhere | Zoom in/out |
| Click + Drag | Anywhere | Pan the map |

### 4.3 Search

Type in the search bar to filter assets by:
- Asset name (e.g., "Independence Avenue")
- Asset ID (e.g., "RD-WH-001")
- Address (e.g., "Windhoek")

### 4.4 Filters

| Filter | Options |
|--------|---------|
| **Asset Type** | All Types, Road, Bridge, Culvert, Sign, Guardrail, Traffic Light |
| **Condition** | All Conditions, Poor (1), Fair (2), Good (3), Very Good (4), Excellent (5) |

### 4.5 Asset Markers

Markers are color-coded circles based on condition:
- 🟢 **Green** — Excellent/Very Good (4-5)
- 🟡 **Amber** — Good (3)
- 🔴 **Red** — Fair/Poor (1-2)

### 4.6 Asset Popup

Click any marker to see:
- Asset name and ID
- Asset type with emoji icon
- Condition rating with color badge
- Address (if available)

### 4.7 Legend

Bottom-left legend explains the color coding:
- Excellent (4-5) = Green
- Good (3) = Amber
- Poor (1-2) = Red

---

## 5. Asset Management

### 5.1 Asset List View

Navigate to **Assets** in the sidebar to see a table of all assets with:
- Asset ID (e.g., RD-WH-001)
- Name
- Type (with color dot)
- Location (address)
- Condition rating (badge)
- Status (active/inactive)
- Last maintenance date

### 5.2 Asset Types

| Type | Icon | Description |
|------|------|-------------|
| Road | 🛣️ | Paved and unpaved road segments |
| Bridge | 🌉 | Bridges, overpasses, and viaducts |
| Culvert | 🚰 | Drainage culverts and pipes |
| Sign | 🪧 | Traffic signs and directional signage |
| Guardrail | 🛡️ | Safety barriers along roads |
| Traffic Light | 🚦 | Traffic signal installations |

### 5.3 Condition Rating

| Rating | Label | Color | Maintenance Priority |
|--------|-------|-------|---------------------|
| 5 | Excellent | Green | None needed |
| 4 | Very Good | Green | Routine only |
| 3 | Good | Amber | Plan within 6 months |
| 2 | Fair | Red | Urgent (within 3 months) |
| 1 | Poor | Red | Emergency (immediate) |

### 5.4 Asset Statuses

| Status | Meaning |
|--------|---------|
| Active | Currently in service |
| Inactive | Temporarily out of service |
| Decommissioned | Permanently removed from service |

### 5.5 Approval Workflow

```
New Asset Created → Pending → Admin Review → Approved / Rejected
```

Only **approved** assets appear on the map and in public lists.

### 5.6 Creating an Asset (API)

```bash
curl -X POST http://localhost:4000/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Road Segment",
    "asset_type_id": "<uuid>",
    "longitude": 17.08,
    "latitude": -22.56,
    "address": "Main Street, Windhoek",
    "condition_rating": 4,
    "construction_date": "2020-01-01"
  }'
```

---

## 6. Inspections

### 6.1 Overview

Inspections are field assessments of asset condition. They feed into:
- Updated condition ratings
- Triggering work orders for repairs

### 6.2 Inspection Types

| Type | When Used |
|------|-----------|
| **Routine** | Scheduled regular inspections |
| **Emergency** | Urgent assessment after event/report |
| **Follow-up** | Re-inspection after maintenance work |
| **Initial** | First inspection of a new asset |

### 6.3 Inspection Workflow

```
Inspector Creates → Pending → Submitted → Admin Approves/Rejects
```

### 6.4 Inspection Fields

| Field | Required | Description |
|-------|----------|-------------|
| Asset | Yes | Which asset was inspected |
| Condition Rating | Yes | 1-5 assessment |
| Findings | Yes | What was observed |
| Recommendations | Yes | Suggested actions |
| Inspection Type | Yes | routine/emergency/follow_up/initial |
| Weather Conditions | No | Weather during inspection |
| GPS Location | No | Where inspector was standing |
| Photos | No | Evidence photos |

### 6.5 Viewing Inspections

The Inspections view shows:
- Inspection ID (INS-YYYY-NNN)
- Associated asset name
- Inspector name
- Date
- Condition rating
- Status badge
- Findings preview

---

## 7. Work Orders

### 7.1 Overview

Work orders authorize and track maintenance activities from creation to completion.

### 7.2 Work Order Lifecycle

```
Created (Pending)
    ↓
Approved (by Admin)
    ↓
Assigned (to Contractor)
    ↓
In Progress (work started)
    ↓
Completed (work finished) OR Cancelled
```

### 7.3 Priority Levels

| Priority | Color | Response Time | Use Case |
|----------|-------|---------------|----------|
| **Critical** | Red | 24-48 hours | Safety hazard, collapse risk |
| **High** | Orange | 1-2 weeks | Rapid deterioration |
| **Medium** | Yellow | 1-3 months | Standard maintenance |
| **Low** | Green | 3-6 months | Preventive, cosmetic |

### 7.4 Work Order Fields

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | Short description of the work |
| Description | Yes | Detailed scope of work |
| Asset | Yes | Which asset needs work |
| Work Type | Yes | e.g., Emergency Repair, Rehabilitation, Replacement |
| Priority | Yes | critical/high/medium/low |
| Estimated Cost | Yes | Budget in NAD |
| Contractor | Yes | Assigned contractor |
| Scheduled Date | Yes | When work should start |
| Actual Cost | No | Final cost (filled on completion) |
| Completion Notes | No | Summary of work done |

### 7.5 Cost Tracking

- **Estimated Cost** — set when work order is created
- **Actual Cost** — filled when work is completed
- Dashboard shows sum of all estimates (budget) vs. sum of actuals (spent)

---

## 8. Authentication

### 8.1 Creating an Account

1. Navigate to `/account/signup`
2. Fill in: Name, Email, Password
3. Click "Create Account"
4. You'll be redirected to the sign-in page

### 8.2 Signing In

1. Navigate to `/account/signin`
2. Enter: Email, Password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### 8.3 Access Levels

| Action | Viewer | Inspector | Contractor | Admin |
|--------|--------|-----------|------------|-------|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| View map | ✅ | ✅ | ✅ | ✅ |
| View assets | ✅ | ✅ | ✅ | ✅ |
| Create assets | ❌ | ✅ | ❌ | ✅ |
| Create inspections | ❌ | ✅ | ❌ | ✅ |
| Approve assets | ❌ | ❌ | ❌ | ✅ |
| Approve inspections | ❌ | ❌ | ❌ | ✅ |
| Create work orders | ❌ | ❌ | ❌ | ✅ |
| Update work progress | ❌ | ❌ | ✅ | ✅ |
| Approve work orders | ❌ | ❌ | ❌ | ✅ |

### 8.4 Public Access (No Login Required)

The following are accessible without authentication:
- Dashboard view (read-only)
- Map view (all approved assets visible)
- Asset list (read-only)
- Inspection list (read-only)
- Work order list (read-only)
- Asset type list
- Reports

---

## 9. API Reference

### 9.1 Authentication Endpoints

#### POST `/api/auth/signup`

Create a new user account.

```json
Request:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "message": "Account created successfully",
  "user": { "id": "uuid", "email": "jane@example.com" }
}
```

#### POST `/api/auth/callback/credentials`

Sign in with email and password. Returns a JWT session cookie.

#### GET `/api/auth/session`

Returns the current session (empty `{}` if not logged in).

---

### 9.2 Asset Endpoints

#### GET `/api/asset-types`

```json
Response:
[
  { "id": "uuid", "name": "Road", "description": "Paved and unpaved roads", "icon": "road", "color": "#3B82F6" },
  { "id": "uuid", "name": "Bridge", "description": "Bridges and overpasses", "icon": "bridge", "color": "#EF4444" }
]
```

#### GET `/api/assets`

Query params: `?type=<asset_type_id>&condition=<1-5>`

```json
Response:
[
  {
    "id": "uuid",
    "asset_id": "RD-WH-001",
    "name": "Independence Avenue",
    "asset_type_name": "Road",
    "address": "Independence Avenue, Windhoek Central",
    "longitude": 17.0836,
    "latitude": -22.5609,
    "condition_rating": 4,
    "status": "active",
    "approval_status": "approved"
  }
]
```

#### GET `/api/assets/:id`

Returns full details of a single asset.

#### POST `/api/assets` (Auth required)

Create a new asset.

#### PUT `/api/assets/:id` (Auth required)

Update an existing asset.

---

### 9.3 Inspection Endpoints

#### GET `/api/inspections`

```json
Response:
[
  {
    "id": "uuid",
    "inspection_id": "INS-2025-001",
    "asset_name": "Independence Avenue",
    "inspector_name": "John Inspector",
    "condition_rating": 4,
    "findings": "Road surface in good condition...",
    "status": "approved",
    "inspection_date": "2025-06-09T..."
  }
]
```

#### POST `/api/inspections` (Auth required)

Create a new inspection record.

---

### 9.4 Work Order Endpoints

#### GET `/api/work-orders`

```json
Response:
[
  {
    "id": "uuid",
    "work_order_id": "WO-2025-001",
    "title": "B1 Highway Emergency Pothole Repair",
    "asset_name": "B1 National Road",
    "priority": "critical",
    "status": "completed",
    "estimated_cost": 85000.00,
    "actual_cost": 72500.00
  }
]
```

---

### 9.5 Dashboard Endpoint

#### GET `/api/dashboard/stats`

```json
Response:
{
  "totalAssets": 15,
  "assetsNeedingAttention": 7,
  "pendingInspections": 2,
  "inspectionsThisMonth": 7,
  "activeWorkOrders": 1,
  "pendingApprovalWorkOrders": 1,
  "totalBudget": 4605000,
  "totalSpent": 482500,
  "assetsByType": [...],
  "recentWorkOrders": [...],
  "pendingApprovals": { "assets": 0, "inspections": 1, "workOrders": 1 }
}
```

---

## 10. Administration Guide

### 10.1 Adding New Asset Types

Insert directly into the database:

```sql
INSERT INTO asset_types (name, description, icon, color)
VALUES ('Toll Gate', 'Toll collection points', 'gate', '#6B7280');
```

### 10.2 Managing Users

Users are created via the signup flow. To promote a user to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### 10.3 Database Backup

Neon provides automatic daily backups. For manual backup:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 10.4 Monitoring

- Check server logs for request traces (each has a traceId)
- Rate limiting logs show when IPs exceed 100 req/min
- Database connection errors are logged with full stack traces

### 10.5 Updating Demo Data

```bash
# Re-run the seed script (uses ON CONFLICT DO NOTHING for safety)
bun run seed-demo-data.mjs
```

---

## 11. Troubleshooting

### 11.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "App Error Detected" on page load | SSR error (e.g., Leaflet on server) | Map is lazy-loaded to avoid this; clear browser cache |
| API returns 401 | Not logged in and trying to mutate data | Sign in at `/account/signin` first |
| API returns 429 | Rate limit exceeded (100 req/min) | Wait 1 minute and retry |
| Dashboard shows 0s | No data in database | Run `bun run seed-demo-data.mjs` |
| Map shows no markers | No approved active assets | Check `approval_status = 'approved'` and `status = 'active'` in database |
| Database connection error | Invalid DATABASE_URL or network issue | Verify `.env` file has correct connection string |
| Blank page | JavaScript error in console | Open DevTools (F12) and check Console tab |

### 11.2 Log Formats

Server logs show:
```
[traceId:abc-123] GET /api/assets 200 245ms
```

Format: `[traceId:<uuid>] <METHOD> <PATH> <STATUS> <DURATION>`

### 11.3 Getting Help

- Check the console output of `bun run dev` for server-side errors
- Check browser DevTools (F12 → Console) for client-side errors
- All API errors include descriptive messages in the response body

---

## Appendix: Demo Data Summary

### Pre-loaded Assets (15)

| ID | Name | Type | Location | Condition |
|----|------|------|----------|-----------|
| RD-WH-001 | Independence Avenue | Road | Windhoek Central | 4/5 |
| RD-WH-002 | Sam Nujoma Drive | Road | Windhoek North | 3/5 |
| RD-WK-003 | B1 National Road | Road | Windhoek South | 2/5 |
| RD-SW-004 | Swakopmund Coastal Road | Road | Swakopmund | 4/5 |
| BR-WH-001 | Robert Mugabe Bridge | Bridge | Windhoek | 3/5 |
| BR-RU-002 | Okavango River Bridge | Bridge | Rundu | 2/5 |
| BR-OS-003 | Oshakati Overpass | Bridge | Oshakati | 4/5 |
| CU-WH-001 | Klein Windhoek Culvert | Culvert | Klein Windhoek | 3/5 |
| CU-WH-002 | Avis Dam Overflow Culvert | Culvert | Windhoek East | 1/5 |
| SN-WH-001 | Speed Limit Sign | Sign | Independence Ave | 5/5 |
| SN-WH-002 | Directional Sign - Airport | Sign | B6 Highway | 4/5 |
| GR-B1-001 | B1 Guardrail - Auas Mountains | Guardrail | Auas Pass | 3/5 |
| GR-B2-002 | B2 Guardrail - Bosua Pass | Guardrail | Bosua Pass | 2/5 |
| TL-WH-001 | Traffic Light - Independence & Mandela | Traffic Light | Windhoek | 5/5 |
| TL-WH-002 | Traffic Light - Robert Mugabe & Tal | Traffic Light | Windhoek | 3/5 |

### Pre-loaded Users (3)

| Name | Email | Role | Organization |
|------|-------|------|--------------|
| Admin User | admin@ramms.gov.na | Admin | NRA Head Office |
| John Inspector | john@ramms.gov.na | Inspector | NRA Northern Region |
| Sarah Contractor | sarah@roadworks.com.na | Contractor | Namibia Roadworks Ltd |

### Pre-loaded Inspections (7) & Work Orders (7)

See the seed script (`seed-demo-data.mjs`) for full details.

---

*End of Document*
