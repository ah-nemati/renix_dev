# Renix.dev — Agency Website

A modern, SEO-optimized landing page for the Renix.dev software agency.

Built with **Astro**, **Tailwind CSS**, and **React** (for the interactive booking form).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Astro 4.x (SSG + hybrid) |
| Styling | Tailwind CSS 3.x |
| Interactivity | React 18 (islands) |
| Animations | CSS transitions + keyframes |
| Deployment | Vercel / Netlify / any static host |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run development server

```bash
npm run dev
# → http://localhost:4321
```

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
renix-dev/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.astro          # Fixed navigation with scroll behavior
│   │   ├── Hero.astro            # Hero section with floating code card
│   │   ├── Services.astro        # 3-column service cards
│   │   ├── Process.astro         # Step-by-step visual process
│   │   ├── Booking.astro         # Booking section wrapper
│   │   ├── BookingForm.jsx       # Interactive React calendar + form
│   │   └── Footer.astro          # Footer with links and socials
│   ├── layouts/
│   │   └── Layout.astro          # HTML shell with full SEO meta tags
│   ├── pages/
│   │   ├── index.astro           # Main landing page
│   │   └── api/
│   │       └── book.ts           # POST endpoint for booking submissions
│   └── styles/
│       └── global.css            # Tailwind directives + component classes
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── .env.example
```

---

## Connecting the Booking Form

The `POST /api/book` endpoint in `src/pages/api/book.ts` is ready for integration.
Uncomment and configure any of these:

- **Email**: [Resend](https://resend.com) — `RESEND_API_KEY`
- **Database**: Supabase, PlanetScale, Neon, or any Postgres
- **CRM**: HubSpot, Pipedrive, etc.

The React `BookingForm.jsx` currently calls `fetch('/api/book', ...)` — just
uncomment the real fetch call (it's stubbed with a timeout) and it wires up automatically.

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Change `output: 'hybrid'` in `astro.config.mjs` to `'server'` if you need full SSR,
or `'static'` if you want a fully static build (disable the API route then).

### Netlify

```bash
npm run build
# Deploy the `dist/` folder
```

---

## Design Tokens

| Token | Value | Use |
|---|---|---|
| `void` | `#050810` | Page background |
| `surface` | `#0c1120` | Cards, inputs |
| `accent` | `#4f7cff` | Primary accent, CTAs |
| `ember` | `#a855f7` | Secondary accent |
| `signal` | `#00e5ff` | Tertiary highlight |
| `ink` | `#e8edf7` | Primary text |
| `ink-muted` | `#6b7a99` | Secondary text |
| Font display | Space Grotesk | Headlines |
| Font body | Inter | Body text |
| Font mono | JetBrains Mono | Labels, code |

---

## License

© 2025 Renix.dev — All rights reserved.
