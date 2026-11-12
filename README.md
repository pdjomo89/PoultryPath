# PoultryPath

**Your Path to Profitable Livestock Farming.**

A consultancy web application that helps entrepreneurs start poultry businesses, manage farms, train staff, hire people with or without experience, and plan for profitability.

## Features

| Page | Route | What it does |
| --- | --- | --- |
| Home | `/` | Hero, services overview, how-it-works, audience paths, CTA |
| Services | `/services` | Six consulting services with detailed deliverables |
| Start a Farm | `/start-a-farm` | 12-week launch roadmap with a progress-tracked checklist |
| Profit Calculator | `/calculator` | Broiler & layer models: profit, margin, ROI, cost per unit, break-even price, cost breakdown; multi-currency |
| Training | `/training` | Course catalogue filterable by level, with enrolment form |
| Jobs | `/careers` | Jobs board filterable by experience (incl. *No experience*), type and training; apply form; employers can post jobs (`/careers?post=1`) |
| Contact | `/contact` | Consultation booking form (pre-selects a service via `?service=<id>`) |

## Languages (English / French)

Visitors switch language with the **EN | FR** toggle in the navigation bar. On a first visit the site follows the browser's language; the choice is then remembered. Links can force a language with `?lang=fr` or `?lang=en`.

- **Interface text** — `src/i18n/messages.ts`. The French object must match the English one key-for-key; a missing translation fails the build.
- **Services, courses, roadmap, sample jobs** — `src/data/content.ts`, with each text written as `{ en: '…', fr: '…' }`.
- **Form error messages from the server** — `convex/lib.ts` (`MESSAGES`).
- Form choices (job type, farm size, etc.) are **stored in English** whatever language the visitor used, and each submission records the visitor's **Language**, so you know whether to reply in English or French. The admin inbox is English-only.

## Hero photos

Each page's hero photo fills the whole hero behind the text. The files live in `public/images/hero/` as `<page>-1600.webp`, `<page>-1200.webp`, `<page>-720.webp` and `<page>-1200.jpg` (pages: home, services, start, calculator, training, jobs, contact, notfound). The current photos are from Wikimedia Commons under **CC BY-SA** licences, which require crediting the photographer. That's why each photo has a small caption and the footer links to a **Photo credits** page (`/credits`). Credit details are in `src/data/photo-credits.json`.

To use your own photos, replace the four files for a page (keep the names). The text sits on the left, so the subject should be on the right; `FRAMING` in `src/components/HeroPhoto.tsx` can mirror a photo or move its focal point. If they're your own pictures, remove that page's entry from `photo-credits.json` to drop its caption. Photo descriptions for screen readers are in `src/i18n/messages.ts` under `photos.alt`.

## Logo

The original artwork is kept in `brand/PoultryPath-logo-original.png`. The site uses optimised copies in `public/`: `logo.webp` / `logo.png` (navigation bar and footer), plus `favicon.png` and `apple-touch-icon.png` (cropped from the rooster). To change the logo, replace these files.

## Brand palette

Defined as CSS variables in `src/index.css`:

| Element | Colour | Token |
| --- | --- | --- |
| Navigation bar, headings, secondary buttons | Deep Forest Green `#1F4D2B` | `--forest` |
| Hero section | Warm Cream `#FBF5E6` | `--cream` |
| CTA buttons, icons, highlights | Golden Yellow `#E8B923` | `--gold` |
| Service cards | White `#FFFFFF` | `--white` |
| Footer | Dark Forest Green `#133420` | `--forest-dark` |

## Getting started

The backend runs on [Convex](https://convex.dev) (database + server functions).

```bash
npm install
npx convex dev         # first run: log in / create a Convex project; writes .env.local. Ctrl+C once it says "ready".
npx convex env set ADMIN_PASSWORD "choose-a-long-password"
npm run dev            # site on http://localhost:5173 + Convex dev sync
npm test               # Convex function + profit-model tests
```

## Receiving form submissions

Every form (consultations, job applications, course registrations, employer job posts) calls a Convex mutation in `convex/forms.ts`, which validates the input and saves it to the `submissions` table. You can also browse the data in the Convex dashboard (`npx convex dashboard`).

- **Email alerts** — set `NOTIFY_EMAIL` and the `SMTP_*` variables with `npx convex env set` (see `.env.example`). Each new submission is emailed to you, with reply-to set to the sender. For Gmail use `smtp.gmail.com`, port 587 and an [App Password](https://myaccount.google.com/apppasswords). Without SMTP, submissions are saved and the email is only logged in the Convex dashboard.
- **Admin inbox** — open `/admin` and sign in with `ADMIN_PASSWORD`. Updates live as submissions arrive. Tabs per form type, mark handled, delete spam.
- **Job posts are moderated** — they arrive as *pending* and appear on the public jobs board only after **Approve & publish**. Employer contact details are never public.
- **Spam protection** — hidden honeypot field, a cap of 100 submissions per form per 10 minutes, and a 15-minute lockout after 10 wrong admin passwords.

### Importing from the old SQLite database

If you ran the earlier Express version and have a `poultryfarm.db` file:

```bash
npm run import:sqlite -- path/to/poultryfarm.db          # into your dev deployment
npm run import:sqlite -- path/to/poultryfarm.db --prod   # into production
```

Original dates and statuses are kept, and re-running skips rows already imported. Requires Node 22.18+.

## Deploying

1. In the Convex dashboard, create a production deploy key and set it as `CONVEX_DEPLOY_KEY` on your static host (Vercel, Netlify, Cloudflare Pages…).
2. Use `npm run deploy` as the build command, and `dist` as the output directory. This deploys the Convex functions and builds the site against the production URL.
3. Set production settings: `npx convex env set --prod ADMIN_PASSWORD ...` (plus `SITE_URL`, `NOTIFY_EMAIL`, `SMTP_*`).

`vercel.json` and `public/_redirects` (Netlify) make direct links like `/calculator` work.

## Project structure

```
convex/
  schema.ts     tables: submissions, adminSessions, rateLimits
  forms.ts      public form mutations (validation, honeypot, rate limit)
  jobs.ts       approved jobs for the public board
  admin.ts      admin sign-in, live inbox, status changes, delete
  notify.ts     email notifications (Node action, nodemailer)
  crons.ts      daily cleanup of expired admin sessions
  migrations.ts helper for the SQLite import
scripts/
  import-sqlite.ts
src/
  components/   Navbar, Footer, ServiceCard, Modal, CtaBand, FormBits
  data/         content.ts — services, courses, roadmap, sample jobs
  lib/          forms.ts (error helpers), profit.ts (+ tests), format.ts, storage.ts
  pages/        one file per route, incl. Admin.tsx
```

## Before going live

- Set a strong `ADMIN_PASSWORD` and configure SMTP in the **production** Convex environment.
- Replace placeholder contact details in `Footer.tsx` / `Contact.tsx`.
- Hide the example job listings with `SHOW_SAMPLE_JOBS = false` in `src/data/content.ts` once you have real vacancies.
- Adjust the calculator defaults to typical prices in your market.
