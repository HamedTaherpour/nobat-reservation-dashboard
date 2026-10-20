# Components

## Component sources

Official shadcn/ui primitives belong under `src/components/ui`. Application wrappers and reusable product behavior belong under `src/components/shared`. Do not modify or recreate an official primitive as an application wrapper unless the wrapper adds a clear product-level API or behavior.

Before creating, fixing, or using a shadcn component, inspect the project-local [shadcn Skill](../.agents/skills/shadcn/SKILL.md) and follow its current project context, composition, styling, accessibility, and verification rules.

When a registry lookup is needed, use the explicit `@shadcn` MCP registry when it is available. Do not guess a registry. If the MCP registry is unavailable, use the project's package runner and the documented CLI workflow, for example `pnpm dlx shadcn@latest search`, `docs`, `view`, or `add` as appropriate. Review generated or fetched files before using them.

Use existing official shadcn primitives first. Create a shared wrapper only when it adds meaningful application behavior, a focused product API, or consistency that would otherwise be repeated. Compose primitives instead of rebuilding them, prefer built-in variants, use semantic tokens, and follow the project's Base UI APIs and Lucide icon configuration from `components.json`.

Keep component APIs focused, explicit, and accessible. Keep feature-specific business logic outside shared components; shared components may coordinate presentation state and user interaction but must not own reservation rules.

## Shared component structure

- Shared application components use `App*` names, such as `AppTable` and `AppDialog`.
- The shared component set includes `AppSelect` for typed option-based Select composition and `AppPagination` for controlled Persian/RTL pagination.
- Components that own responsive switching use `Responsive*` names, such as `ResponsiveDialog` and `ResponsiveTable`.
- Every directory under `src/components/shared` must contain an `index.ts` barrel.
- A shared barrel explicitly exports the directory's primary public component and only consumer-required public types. Tests, internal helpers, private hooks, and implementation-only types stay private.
- No barrels are required under `src/components/ui`; preserve the generated shadcn file and import conventions there.
- Feature directories do not need barrels unless an intentional public module boundary requires one.

## Quality bar

Shared components must remain independent of reservation-specific business logic. Preserve accessible names, labels, keyboard behavior, focus handling, semantic HTML, and correct `aria-*` state. Add focused component tests for observable behavior and user interactions, including loading/empty/error states and any responsive contract that the component owns.

## Props conventions

- Use a named `*Props` type for every application-owned reusable component. Place component-specific props in its companion `*.types.ts` file and group related types rather than creating unnecessary one-type files.
- Accept props as `props: ComponentProps` and destructure inside the function body. This also applies to generic components and `forwardRef` render functions.
- Keep simple positional parameters positional; this convention applies to existing object-shaped inputs, not every function.

```tsx
// Incorrect
function AppEmpty({ title }: AppEmptyProps) {
  return <h2>{title}</h2>;
}

// Correct
function AppEmpty(props: AppEmptyProps) {
  const { title } = props;
  return <h2>{title}</h2>;
}
```

Generated shadcn/ui primitives under `src/components/ui` are intentional exceptions and should not be rewritten for this stylistic convention.

## Shared component adoption

When an application-owned screen has a compatible `App*` or `Responsive*` component, use that shared component instead of composing the corresponding shadcn primitive directly. This includes `AppSelect` for typed option-based selects, including feature filters and forms. A direct primitive is justified when the shared API cannot express a required behavior or when the code is the shared component's own implementation; document such exceptions in the completion report. Do not modify generated primitives to enforce this rule.
