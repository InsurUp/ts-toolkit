# Changelog

All notable changes to this workspace are recorded here. Per-package versions are bumped in their own `package.json`; this file tracks the cross-cutting story.

## Unreleased — Unified filter/search refactor

**Affected packages:** `@insurup/contracts`, `@insurup/sdk`, `@insurup/table-adapter-core`, `@insurup/table-adapter-{react,vue,svelte}`.

This is a breaking change. The motivation: the prior surface had two parallel APIs (`setFilter` / `setSearch`) plus auto-generated input types that walked every model field — even fields the server doesn't accept for filtering or searching, with operator names that didn't match the server (`ncontains` vs `notContains`). The result was a surface that lied about what the server accepts. The refactor truthful-up the wire contract end-to-end and folds filter+search into one consumer-facing concept.

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

`ModelFilterInput<T>` and `ModelSearchInput<T>` are gone. Each entity now has a `Query<Model>FilterInput` and `Query<Model>SearchInput` that mirror the server schema exactly (only filterable/searchable fields, only supported operators per field). New: `Query<Model>UnifiedFilterInput` — the per-field union of filter ops or `$search`-marked search ops, used by the table adapter.

Migration for direct SDK callers: most filter/search code keeps working. Code that filtered on fields the server doesn't accept (e.g. `policyCount` on `policy-transfers`, `state` on `webhook-deliveries`) now type-errors — those filters were no-ops at the wire anyway.

#### 4. Table adapter — `setSearch` removed, `setFilter` unified

The adapter no longer exposes `setSearch` / `getSearch` / `clearSearch` / `defaultSearch`. Every entry goes through `setFilter`; mark a per-field value with `$search: true` to route it to the server's search slot.

```ts
// Before
adapter.setFilter({ type: { eq: CustomerType.Individual } });
adapter.setSearch({ name: { textSearch: { value: 'ali' } } });

// After
adapter.setFilter({
  type: { eq: CustomerType.Individual },
  name: { $search: true, textSearch: 'ali' },
});
```

The adapter splits the unified value into the server's `filter:` and `search:` slots at fetch time and strips the marker. `and` / `or` combinators are supported recursively — items split per-bucket. (Caveat: an `or` item that mixes filter and search keys becomes an implicit AND between buckets at the wire — keep each `or` item homogeneous if intent matters.)

The internal generics on `ITableAdapter`, `BaseTableAdapter`, `InfiniteTableAdapter`, `TableApi`, `TableAdapterOptions`, and `EntityTableOptions` collapsed from `(TFilterInput, TSearchInput)` to `(TUnifiedFilterInput)`. External code parameterizing those types needs to drop the third type argument.

Migration recipe:

| Before                                                        | After                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `adapter.setSearch({ name: { textSearch: { value: 'x' } } })` | `adapter.setFilter({ name: { $search: true, textSearch: 'x' } })` |
| `defaultSearch: { name: { … } }`                              | Fold into `defaultFilter` with `$search: true` on the field       |
| `adapter.getSearch()`                                         | Look at the `$search`-marked entries in `getFilter()`             |
| `adapter.clearSearch()`                                       | `setFilter({})` or `clearFilter()` (clears everything)            |

#### 5. `searchScore` stays a regular field

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

### Coverage

- 89 contracts unit tests (incl. 10 `expectTypeOf` cases for the unified filter type)
- 285 SDK unit tests (incl. the `normalizeSearchInput` shorthand normalizer)
- 270 table-adapter-core unit + integration tests
- 49 framework adapter unit tests (React / Vue / Svelte combined)
- 124 e2e tests against the live API (operator coverage, score boost/constant, mixed filter+search, every entity)

Run `bun run typecheck && bun run lint && bun run format:check && bun run build && bun run test` for the standard verification. E2E is opt-in per package (`bun run test:e2e`) and requires `INSURUP_E2E_*` creds in the repo-root `.env`.

---

## Unreleased — SDK-level filter/search unification (follow-up)

The table adapter already exposed a unified `setFilter` API with `$search: true` markers. This follow-up pushes the same unification down to the SDK layer so direct-SDK callers and adapter callers share one mental model. The seam between layers is gone.

### Breaking changes

#### `Get<Entity>Options.search` removed; `filter` takes the unified shape

```ts
// Before
client.customers.getCustomers({
  first: 20,
  filter: { type: { eq: CustomerType.Individual } },
  search: { name: { textSearch: 'ali' } },
});

// After
client.customers.getCustomers({
  first: 20,
  filter: {
    type: { eq: CustomerType.Individual },
    name: { $search: true, textSearch: 'ali' },
  },
});
```

Mechanical migration: every key under `search: { … }` moves up under `filter:` with `$search: true` added to its value.

#### `GetQueryOptions` generic collapsed

```ts
// Before
GetQueryOptions<TFieldKey, TFilter, TSearch, TSort>;

// After
GetQueryOptions<TFieldKey, TUnifiedFilter, TSort>;
```

External code parameterizing `GetQueryOptions` (or any per-entity `Get<Entity>Options`) drops the `TSearch` argument.

#### Adapter generics collapsed too

`BaseTableAdapter`, `InfiniteTableAdapter`, `ITableAdapter`, `TableApi`, `TableApiConfig`, `QueryOptionsBuilder`, `QueryOptionsBuilderArgs`, `createEntityTable`, `createInfiniteEntityTable`, and per-entity factories all dropped their `TFilterInput` / `TSearchInput` generics (they're still used as internal wire-shape types inside the SDK, but never thread through the adapter's public API). External code typing these directly: remove both arguments, keep `TUnifiedFilterInput`.

#### `splitNode` removed from the adapter

The split logic moved to `@insurup/sdk`'s `splitUnifiedFilter` (also re-exported from the public SDK API for advanced/test use). `BaseTableAdapter.buildVariables` now forwards `this.filter` (unified) directly to the user's `buildFetchQueryOptions` callback; the SDK splits at request time.

### Wire payload — unchanged

The actual GraphQL request still carries both `filter:` and `search:` variables. Only the consumer-facing input shape collapsed.

### New: `splitUnifiedFilter` exported from `@insurup/sdk`

```ts
import { splitUnifiedFilter } from '@insurup/sdk';
const { filter, search } = splitUnifiedFilter(unifiedInput);
```

Useful for tests, custom integrations, or any code path that needs the same routing the SDK does internally.
