# Architecture

Nobat uses a lightweight feature-based architecture. Keep boundaries clear without adding layers or abstractions that the current product does not need.

## Responsibilities

- `src/app` owns Next.js App Router entry points, route composition, metadata, and page-level composition.
- `src/features` owns feature-specific UI, hooks, types, constants, mocks, utilities, validation, and business rules. Keep related files co-located; the reservations feature separates pure domain logic in `domain/`, storage in `persistence/`, React state in `hooks/`, and feature UI in `dashboard/`.
- `src/components/ui` contains official shadcn/ui primitives and their generated source. Treat these as the low-level UI foundation.
- `src/components/shared` contains reusable application components that compose the UI primitives. Shared components must remain independent of reservation-specific business logic.
- `src/hooks` contains reusable, domain-agnostic React hooks with their focused tests.
- `src/lib` contains utilities genuinely shared across features.
- `src/test` contains shared test setup.

## Co-location and boundaries

Keep a feature's domain types, constants, mocks, pure utilities, tests, and feature UI together when they change together. Use explicit imports across feature boundaries rather than creating a central registry prematurely.

Separate domain logic from presentation: validation, normalization, status transitions, filtering, sorting, and metrics belong in feature utilities or domain modules; components should render state and coordinate user interaction.

Prefer the smallest useful module and the existing project pattern. Do not introduce services, repositories, global state, generic frameworks, or extra directories unless a concrete requirement justifies them.
