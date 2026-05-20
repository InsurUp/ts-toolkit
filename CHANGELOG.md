# Changelog

All notable changes to this workspace are recorded here. Per-package versions are bumped in their own `package.json`; this file tracks the cross-cutting story.

## Unreleased — Unified filter/search end-to-end

**Affected packages:** `@insurup/contracts`, `@insurup/sdk`, `@insurup/table-adapter-core`, `@insurup/table-adapter-{react,vue,svelte}`.

Breaking change. The prior surface had two parallel APIs (`setFilter` / `setSearch` on the adapter; `filter:` / `search:` slots in `Get<Entity>Options`) plus auto-generated input types that walked every model field — even fields the server doesn't accept for filtering, with operator names that didn't match the server (`ncontains` vs `notContains`). The result lied about what the server accepts. This refactor truthful-up the wire contract end-to-end and folds filter+search into one consumer-facing concept at every layer.

### Breaking changes

#### 1. Operator renames on `StringOperationFilterInput`

The not-prefixed variants now match the server names:

- `ncontains` → `notContains`
- `nstartsWith` → `notStartsWith`
- `nendsWith` → `notEndsWith`

The old names were silently dropped by the server (no error, no match). Anyone relying on them was getting empty results.

#### 2. `SearchStringOperationFilterInput` widened and tightened

- New ops: `contains`, `notContains`, `startsWith`, `notStartsWith`, `endsWith`, `notEndsWith`. Each accepts `SearchTextInputValue` (string shorthand or `{ value, score? }` long form).
- `eq` / `neq` now take `SearchTextInput | string` (previously `string`); the SDK normalizes `'foo'` → `{ value: 'foo' }`.
- `in` / `nin` now take `SearchTextListInput | string[]`; the SDK normalizes `['a','b']` → `{ values: ['a','b'] }`.

Migration: existing `eq: 'foo'` and `in: ['a','b']` keep working (shorthand). Existing long-form `{ value }` keeps working.

#### 3. Per-entity filter/search input types are hand-declared

`ModelFilterInput<T>` and `ModelSearchInput<T>` are gone. Each entity now has a `Query<Model>FilterInput` and `Query<Model>SearchInput` that mirror the server schema exactly (only filterable/searchable fields, only supported operators per field). New: `Query<Model>UnifiedFilterInput` — the per-field union of filter ops or `$search`-marked search ops.

Code that filtered on fields the server doesn't accept now type-errors — those filters were no-ops at the wire anyway.

#### 4. One unified `filter:` everywhere — `setSearch` and `Get<Entity>Options.search` removed

The adapter no longer exposes `setSearch` / `getSearch` / `clearSearch` / `defaultSearch`. `Get<Entity>Options` no longer takes a `search:` slot. Both surfaces accept one unified per-field shape; mark a value with `$search: true` to route it to the server's search slot.

```ts
// Before — adapter
adapter.setFilter({ type: { eq: CustomerType.Individual } });
adapter.setSearch({ name: { textSearch: { value: 'ali' } } });

// Before — direct SDK
client.customers.getCustomers({
  filter: { type: { eq: CustomerType.Individual } },
  search: { name: { textSearch: 'ali' } },
});

// After — both
adapter.setFilter({
  type: { eq: CustomerType.Individual },
  name: { $search: true, textSearch: 'ali' },
});
client.customers.getCustomers({
  filter: {
    type: { eq: CustomerType.Individual },
    name: { $search: true, textSearch: 'ali' },
  },
});
```

The SDK splits the unified value into the server's `filter:` and `search:` slots at request time and strips the marker. `and` / `or` combinators are supported recursively — items split per-bucket. (Caveat: an `or` item that mixes filter and search keys becomes an implicit AND between buckets at the wire — keep each `or` item homogeneous if intent matters.)

Mechanical migration for direct-SDK callers: every key under `search: { … }` moves up under `filter:` with `$search: true` added to its value.

Migration recipe for adapter callers:

| Before                                                        | After                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `adapter.setSearch({ name: { textSearch: { value: 'x' } } })` | `adapter.setFilter({ name: { $search: true, textSearch: 'x' } })` |
| `defaultSearch: { name: { … } }`                              | Fold into `defaultFilter` with `$search: true` on the field       |
| `adapter.getSearch()`                                         | Look at the `$search`-marked entries in `getFilter()`             |
| `adapter.clearSearch()`                                       | `setFilter({})` or `clearFilter()`                                |

#### 5. Generics collapsed across the public surface

`GetQueryOptions<TFieldKey, TFilter, TSearch, TSort>` → `GetQueryOptions<TFieldKey, TUnifiedFilter, TSort>`. Every per-entity `Get<Entity>Options` and every adapter type (`ITableAdapter`, `BaseTableAdapter`, `InfiniteTableAdapter`, `TableApi`, `TableApiConfig`, `QueryOptionsBuilder`, `QueryOptionsBuilderArgs`, `createEntityTable`, `createInfiniteEntityTable`, all 16 per-entity factories) dropped its `TFilterInput` / `TSearchInput` arguments — only `TUnifiedFilterInput` threads through the public surface. External code parameterizing these types: drop the `TFilter` / `TSearch` arguments, keep `TUnifiedFilterInput`.

#### 6. `searchScore` stays a regular field

No adapter magic. Select it as a column (`col.searchScore()`), sort by it via the standard sort state (`{ id: 'searchScore', desc: true }`). The adapter doesn't auto-include or auto-sort it when a search clause is present.

### New: runtime introspection of the filter/search surface

`@insurup/contracts` ships generated meta per entity (`QueryCustomerModelMeta`, `QueryCaseModelMeta`, …) that now includes `filterable`, `searchable`, `filterOperators`, and `searchOperators` per field. Useful for dynamic filter UIs:

```ts
import { QueryCustomerModelMeta } from '@insurup/sdk';

for (const [name, info] of Object.entries(QueryCustomerModelMeta)) {
  if (info.filterable) console.log(`${name}: ${info.filterOperators?.join(',')}`);
}
```

The meta is derived directly from the per-entity FilterInput / SearchInput interfaces at codegen time — no separate spec file, no drift.

### Wire payload — unchanged

The GraphQL request still carries both `filter:` and `search:` variables. Only the consumer-facing input shape collapsed; the wire split happens inside the SDK at request time.

### Verification

Run `bun run typecheck && bun run lint && bun run format:check && bun run build && bun run test` for the standard verification. E2E is opt-in per package (`bun run test:e2e`) and requires `INSURUP_E2E_*` creds in the repo-root `.env`.
