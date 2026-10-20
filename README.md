# Nobat Reservation Dashboard

Nobat is an independent reservation management dashboard for reviewing, searching, filtering, creating, and updating customer reservations in a Persian, right-to-left interface. It is a frontend-only application designed to demonstrate a polished, responsive reservation workflow.

## Features

- Reservation KPIs for total, pending, confirmed, cancelled, and today’s reservations.
- Search by customer name, status filtering, date sorting, and paginated reservation lists.
- Responsive desktop table and mobile card views.
- Reservation details with status management and cancellation confirmation.
- Jalali date selection and Persian-localized dates, times, labels, and digits.
- Responsive reservation creation flow with validation and accessible feedback.
- Browser persistence with recovery handling for invalid or unavailable stored data.

## Tech stack

- Next.js App Router and React
- Strict TypeScript
- Tailwind CSS v4
- shadcn/ui primitives with reusable application-level `App*` components
- Feature-based co-location for domain logic, persistence, hooks, and UI
- Vitest and React Testing Library for unit and component tests
- Playwright for end-to-end browser flows
- pnpm, Oxlint, and Oxfmt

## Architecture

The project keeps responsibilities close to the feature that owns them:

- `src/app` contains App Router entry points, metadata, and page composition.
- `src/features/reservations` contains reservation domain rules, persistence, hooks, dashboard UI, list UI, types, fixtures, and focused tests.
- `src/components/ui` contains generated shadcn/ui primitives.
- `src/components/shared` contains reusable product components such as `AppTable`, `AppDialog`, `AppSelect`, and responsive wrappers.
- `src/lib` contains utilities shared across features.

## Local development

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Quality and testing

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e -- --workers=1
```

Install the Playwright browser once when needed:

```bash
pnpm exec playwright install chromium
```

## Deployment

The project is ready for a standard Next.js deployment on Vercel. No environment variables or backend services are required by the current frontend, so no Vercel-specific configuration is necessary.

Reservations are stored in the browser’s `localStorage`. They are therefore local to the current browser and are not synchronized across users, browsers, or devices. Clearing browser storage removes the local reservation state.

## Repository

[GitHub: HamedTaherpour/nobat-reservation-dashboard](https://github.com/HamedTaherpour/nobat-reservation-dashboard)
