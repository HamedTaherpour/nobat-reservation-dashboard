# Nobat agent instructions

Nobat is a Persian, right-to-left reservation management dashboard. It uses Next.js App Router, React, strict TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, and Playwright.

Read the relevant instruction file before changing code:

- [Architecture](instructions/architecture.md) — project boundaries and co-location.
- [Frontend implementation](instructions/frontend-implementation.md) — React, Next.js, RTL, responsive behavior, and testing.
- [Components](instructions/components.md) — shadcn/ui, shared components, exports, accessibility, and component tests.
- [Types and functions](instructions/types-and-functions.md) — TypeScript, domain types, utilities, validation, and errors.

Instruction expectations:

- Inspect the existing implementation and README before proposing a new pattern.
- Read the relevant instruction files before implementation.
- Apply only the instructions relevant to the task; preserve established project decisions.
- Use existing components and conventions before introducing new abstractions.
- Keep changes within the requested scope. Report unrelated inconsistencies instead of refactoring them.
- Do not start follow-up work that was not requested.
- For every implementation task, check whether architecture, conventions, component contracts, or relevant documentation changed.
- Update affected instruction documents in the same task when a durable rule changes.
- Keep documentation updates minimal, consistent, and free of duplicate or contradictory guidance.
- Do not change governance documents for incidental implementation details.

Code review priorities:

1. Correctness and regressions.
2. Type safety and state correctness.
3. Accessibility and RTL behavior.
4. Security and data handling where applicable.
5. Test reliability.
6. Maintainability and documentation consistency.

Before handoff, run the checks relevant to the change; the full project verification is:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Do not create commits or push changes without explicit approval.

Every completion report must include one of:

- `Documentation: Updated — <files>`
- `Documentation: No update required`
