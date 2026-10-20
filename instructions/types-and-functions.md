# Types and functions

- Keep TypeScript strict. Use explicit public API contracts where they clarify a module boundary, and prefer type inference for obvious local implementation details.
- Choose `type` or `interface` based on the actual contract; do not impose a universal restriction. Prefer precise unions, readonly data, indexed access types, and `satisfies` where they express the domain clearly.
- Use `as const satisfies` for immutable compile-time configuration when it validates the shape while preserving literal types. Remember that `satisfies` does not perform runtime validation.
- Avoid `any`, unsafe assertions, and unnecessary abstractions. Use `unknown` at untrusted boundaries and narrow it deliberately.
- Public types are types imported by consumers across a module boundary; keep implementation-only types, helper types, and test fixtures private unless consumers need them.
- Exported, meaningful public type and interface contracts for feature Hooks, feature services, and persistence modules belong in a related `*.types.ts` companion file. Group related contracts together rather than creating one file per type. Small implementation-private types and type predicates may remain colocated with implementation, and test-only fixture types and helpers may remain in test files. Keep domain types separate from persistence and state orchestration contracts when they represent distinct boundaries. Use direct imports in feature directories; do not introduce feature-level barrels. Preserve the mandatory `index.ts` convention for shared components.
- Name domain types and values after the business concept, as in `Reservation`, `ReservationStatus`, `ReservationInput`, and `ReservationValidationResult`.
- Prefer pure functions for normalization, validation, filtering, sorting, metrics, and status rules. They should be deterministic, explicit about inputs and outputs, and free of UI or browser dependencies.
- Keep pure domain calculations independent of React. Use generics when they provide genuine reusable type safety, not merely to make a function appear general.
- Use named parameter objects when they improve readability, especially for complex or multi-argument public APIs.
- Keep validation near the feature domain. Return structured, field-addressable errors when callers need to render validation feedback; do not hide expected validation failures behind thrown exceptions.
- Use exceptions only for genuinely exceptional or unrecoverable conditions, and preserve enough context for the caller to handle them appropriately.
- Keep abstractions minimal. Do not generalize a one-feature function, type, or adapter until a concrete second use case exists.
- Keep companion type and constant files when they provide clear organization and preserve a useful feature boundary.
- Put meaningful feature configuration, option sets, labels, and stable mappings in a companion `*.constants.ts` file. Keep a trivial single-use literal or a private helper map local when moving it would obscure ownership or create an unnecessary module.
- Prefer clear names and small functions over clever indirection. Document a non-obvious invariant at the point where it matters.
- Do not require `FC<Props>` for React components; preserve generic component compatibility.

## Named structured parameters

- Reusable components must declare named `*Props` types. Structured hook options use named `*Options` or `*Params` types, and structured function inputs use a meaningful named type.
- Keep component-specific props and public hook/function contracts in the appropriate companion `*.types.ts` file, grouped with related types. Keep private scalar or helper types local when that is clearer.
- Accept object-shaped arguments through a named parameter and destructure inside the function body. Keep simple positional parameters positional when they are already clear.

```tsx
// Incorrect
function DetailItem({ label }: { label: string }) {
  return <span>{label}</span>;
}

// Correct
type DetailItemProps = { label: string };

function DetailItem(props: DetailItemProps) {
  const { label } = props;
  return <span>{label}</span>;
}
```

Do not rewrite generated shadcn/ui primitives under `src/components/ui` solely to apply this convention; treat those files as intentional exceptions.
