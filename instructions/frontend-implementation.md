# Frontend implementation

## React and Next.js

- Follow the Next.js App Router conventions already used by the project.
- Keep components server-rendered by default. Add `"use client"` only when a component needs state, event handlers, browser APIs, or a client-only library.
- Keep client boundaries as narrow as practical and pass serializable data across server/client boundaries.
- Prefer existing shared components and shadcn primitives over one-off markup.
- Keep state close to the component or feature that owns it. Lift state only when multiple consumers need the same source of truth.
- Use controlled components when the parent owns the value, validation, submission, or reset behavior. Avoid duplicate local copies of controlled state.
- Use `useEffect` to synchronize React with external systems. Do not use it for values derivable during render, actions that belong in event handlers, or chains of effects that trigger other state updates.
- Prefer appropriate state ownership or keyed resets over prop-to-state synchronization. Include complete dependency arrays and clean up subscriptions, timers, and external resources.
- Use `useMemo` only as a performance optimization for a justified expensive computation. Prefer direct calculations when inexpensive; avoid unstable object or function dependencies and never rely on memoization for correctness.
- Use `useCallback` when stable function identity has a meaningful benefit, such as a memoized consumer or hook dependency. Do not wrap every handler or use it to conceal incorrect dependencies or state ownership.
- Avoid redundant or duplicated derived state. Prefer immutable updates and stable keys for dynamic lists.

## Custom hooks and naming

- Extract reusable stateful behavior into a custom hook only when it has a clear responsibility and a real reuse or lifecycle boundary. Do not create a hook merely to move a few lines of code.
- Keep domain calculations in pure utilities when React is unnecessary. Effects and subscriptions inside hooks must have complete dependencies and proper cleanup.
- Name local event handlers `handleX` and callback props `onX`. Pure utilities should use descriptive action or calculation names, not misleading `handle` prefixes.

## Responsive behavior

Build for the existing responsive conventions and use semantic responsive variants. `ResponsiveDialog` renders an `AppDialog` below the `md` breakpoint and an `AppDrawer` at or above it.

ResponsiveDialog has a deliberate remounting contract: changing across the breakpoint switches primitive types and remounts the dialog content subtree. Any state that must survive a breakpoint change, including controlled form values and form controllers, must be owned outside that subtree. Do not rely on local child state persisting across the switch.

## RTL and Persian accessibility

- Preserve the document's `lang="fa"` and `dir="rtl"` setup.
- Write user-facing copy in Persian where the product experience requires it; do not hard-code English-only labels into shared behavior.
- Use semantic HTML, associated labels, accessible names, keyboard support, visible focus, and appropriate status/error announcements.
- Follow the existing shadcn accessibility composition, including required titles for dialog-like surfaces and correct `aria-*` state.
- Test Persian digits, phone/date/time normalization, text direction, and content that expands beyond the expected length when relevant.

## Testing

Add or update focused unit/component tests for changed behavior, especially shared component states, validation, accessibility, and responsive contracts. Keep pure domain utilities deterministic and test their edge cases. Run the project verification commands before handoff; use the end-to-end suite for user flows affected by the change.
