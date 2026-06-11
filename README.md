# Sales Outreach CRM

A fullstack portfolio CRM for sales workflow, pipeline management and outreach operations.

**Live demo:** https://sales-outreach-crm.vercel.app  
**GitHub:** https://github.com/Adellaghmari/sales-outreach-crm

## Overview

Sales Outreach CRM brings leads, accounts, pipeline, outreach, follow ups and reporting into one workspace. Outreach is simulated, so no real emails are sent, but the day to day flow should feel familiar to anyone who has worked in a small sales team.

The app runs in demo mode without a database, or with PostgreSQL through Neon when `DATABASE_URL` is set.

## What you can do

- Review pipeline health and daily priorities on the dashboard
- Browse and score leads, then open a full lead profile with timeline and notes
- View accounts with company level pipeline value and contacts
- Move deals through pipeline stages and inspect won or lost outcomes
- Draft outreach, apply templates and track draft, sent and replied states
- Plan follow ups with overdue detection and reschedule
- Read reports with charts and short written insights
- Create new leads from the top navigation

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, React Router, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| API | REST |
| Deployment | Vercel, Render, Neon |

## How the workflow fits together

Leads enter from different sources. Outreach is drafted and tracked as simulated sends. Leads move from new to contacted, responded and qualified. Deals progress through stages with probability. Follow ups shape daily priorities. The dashboard and reports surface risk, reply activity and forecast.

## Lead scoring

Leads are scored from 0 to 100 using title, company size, status, source quality, reply status, deal value, activity and follow up timing.

Hot (75+), Warm (55+), Cold (35+), Low priority

## Pipeline logic

Expected revenue = deal value × probability / 100  
Stage changes update probability automatically  
Close date proximity triggers risk badges  
Won and lost deals keep reason and lesson learned

## Outreach workflow

Select a lead and template, personalise with `{{first_name}}` and `{{company}}`, save a draft or mark as sent, then mark as replied to update lead status.

## Local setup

### Demo mode (no database)

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Backend runs in demo mode when `DATABASE_URL` is not set.

### Full PostgreSQL mode

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL
npm run db:setup
npm run seed
npm run dev
```

```bash
cd frontend
cp .env.example .env
npm run dev
```

## Environment variables

**Backend:** `PORT`, `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV`  
**Frontend:** `VITE_API_URL`

## API endpoints

| Method | Endpoint |
|--------|----------|
| GET | /api/health, /api/dashboard, /api/reports, /api/pipeline |
| GET/POST | /api/leads, /api/companies, /api/outreach, /api/templates |
| PUT | /api/deals/:id/stage, /api/outreach/:id, /api/follow-ups/:id |

## Recruiter walkthrough

1. Open the dashboard and review today's priorities
2. Browse Leads and open Amina El Karimi at Northstar Revenue
3. Check Accounts for company level pipeline and contacts
4. Move a deal on the Pipeline board and inspect won or lost outcomes
5. Create a new lead from the top navigation
6. Draft outreach, apply a template and mark a message as sent
7. Complete or reschedule a follow up
8. Review Reports for insights below the charts

## Demo companies

Northstar Revenue, Mavenly, Clearbitic, OrbitWorks, Velora Systems, Credora Pay, Fjordline Analytics, Horizon Grid, Axentia Labs, Meridian Commerce, SignalDesk, VantaCore, LumaFlow, Nexora Digital, Copperlane, BrightPath Operations
