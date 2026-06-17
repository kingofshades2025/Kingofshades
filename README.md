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
- Self-contained CSS "tinted glass" placeholders (no external image dependencies)

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
| `/booking`   | 5-step booking wizard mockup (service → details → date → info → payment) |
| `/contact`   | Contact form, hours, info, map placeholder                         |

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
  site.ts        # site config (nav, contact, socials)
  data.ts        # all mock/sample data
  utils.ts accents.ts
```

## Phase 2 (not included)

Authentication, booking logic, payment processing, database integration, real image
uploads, and live maps.
