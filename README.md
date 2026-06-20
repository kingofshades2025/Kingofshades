# King of Shades — Website (Phase 1)

A modern, responsive **frontend-only** prototype for King of Shades, a premium window
tinting and custom vinyl company. This phase delivers the complete customer journey and
admin workflow as polished, view-only mockups — **no backend, database, auth, or payment
processing is wired up yet** (that's Phase 2).

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** for icons
- **Resend** for contact & booking confirmation emails
- Self-contained CSS "tinted glass" placeholders (no external image dependencies)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
| -------- | ----------- |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com/api-keys) |
| `EMAIL_FROM` | Verified sender, e.g. `King of Shades <contact@kingofshadesnj.com>` |
| `EMAIL_TO` | Business inbox that receives notifications |
| `NEXT_PUBLIC_APP_URL` | Public site URL, e.g. `https://kingofshadesnj.com` |

**Resend domain setup:** In the Resend dashboard, add `kingofshadesnj.com` and paste the DNS records (SPF, DKIM) into Hostinger → Domains → DNS. Emails won't send from your domain until verification completes.

## Deploy (Vercel + Hostinger)

1. Import the GitHub repo at [vercel.com](https://vercel.com).
2. Add the environment variables above in **Vercel → Project → Settings → Environment Variables**.
3. Deploy — Vercel gives you a `*.vercel.app` URL.
4. In **Vercel → Domains**, add `kingofshadesnj.com` and `www.kingofshadesnj.com`.
5. In **Hostinger → DNS**, add the records Vercel shows (typically a CNAME for `www` and an A record for `@`).
6. Wait for SSL — usually a few minutes.

## Email Flows

- **Contact form** (`/contact`) — sends a notification to `EMAIL_TO` and a confirmation to the customer.
- **Booking wizard** (`/booking`) — step 5 sends a booking request notification + customer confirmation (no payment yet).

## Design

Luxury tint-shop aesthetic — black & charcoal grays, white text, and gold accents, with a
clean, conversion-focused, mobile-first layout.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # lint
```

## Pages

### Customer-facing (`app/(site)/`)
| Route        | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `/`          | Homepage — hero, services, why-choose, before/after, testimonials  |
| `/services`  | Detailed service sections (automotive, residential, commercial, decals) |
| `/gallery`   | Filterable project grid with lightbox modal                        |
| `/booking`   | 5-step booking wizard — sends confirmation emails on submit |
| `/contact`   | Contact form with Resend email notifications |

### Admin dashboard (`app/admin/`)
| Route                  | Description                                  |
| ---------------------- | -------------------------------------------- |
| `/admin/login`         | Login screen (no real auth — opens dashboard)|
| `/admin`               | Dashboard overview with stats & charts       |
| `/admin/appointments`  | Appointments table with mock actions         |
| `/admin/customers`     | Customer list & service history              |
| `/admin/services`      | Service management (add/edit/remove UI)      |
| `/admin/gallery`       | Image upload & category management UI         |
| `/admin/payments`      | Payments, invoices & revenue summary         |
| `/admin/settings`      | Business info, hours, pricing, socials, notifications |

## Project Structure

```
app/
  (site)/        # marketing pages (shared Navbar + Footer layout)
  admin/
    login/       # standalone login
    (panel)/     # dashboard pages (shared sidebar layout)
components/
  ui/            # reusable primitives (Button, Card, Field, TintGlass, …)
  layout/        # Navbar, Footer
  sections/      # PageHeader, CtaBand
  admin/         # AdminShell, AdminUI helpers
  booking/ gallery/ contact/   # feature components
lib/
  site.ts        # site config (nav, contact, socials, domain)
  email.ts       # Resend client + HTML email templates
  data.ts        # all mock/sample data
app/actions/
  contact.ts     # contact form server action
  booking.ts     # booking request server action
  utils.ts accents.ts
```

## Phase 2 (not included)

Authentication, booking logic, payment processing, database integration, real image
uploads, and live maps.
