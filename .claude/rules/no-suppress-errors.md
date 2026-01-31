---
paths:
  - "**/*.{ts,tsx,svelte,vue}"
---

# No Suppressing Errors or Warnings

Linter and type errors exist for a reason. Always fix the root cause.

## Forbidden Suppressions

```typescript
// NEVER use these
// @ts-ignore
// @ts-nocheck
// @ts-expect-error
// eslint-disable
// eslint-disable-next-line
/* eslint-disable */
// prettier-ignore (for hiding issues)
```

## What To Do Instead

```typescript
// Bad - Suppressing the error
// @ts-ignore
const value = obj.maybeUndefined.property;

// Good - Fix the actual issue
const value = obj.maybeUndefined?.property;

// Good - Proper type narrowing
if (obj.maybeUndefined) {
  const value = obj.maybeUndefined.property;
}
```

## Never Use `any`

```typescript
// Bad
const data: any = fetchData();
function process(input: any): any { }

// Good
const data: unknown = fetchData();
function process<T>(input: T): Result<T> { }
```

## Rules

- Fix type errors with proper types, guards, or refactoring
- Fix linter warnings by following the lint rule's guidance
- If a lint rule seems wrong for the project, discuss removing it from config - don't suppress it inline
- **Never use `any`** - use `unknown`, generics, or proper type definitions instead

## Exception Process

If an error is truly unfixable due to technical limitations:

1. **STOP** - Do not add any suppression comment
2. **ASK** - Explain the technical reason why it cannot be fixed
3. **WAIT** - Only add suppression if explicitly permitted by the user
