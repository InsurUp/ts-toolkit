/**
 * @insurup/table-adapter-core/internal
 *
 * Currently exposes `ITableAdapter` only — the structural interface that
 * framework wrappers (e.g. `@insurup/table-adapter-svelte`) reference to type
 * an adapter without depending on the concrete `BaseTableAdapter` /
 * `InfiniteTableAdapter` classes.
 *
 * This entry point is intentionally minimal. It is not covered by the main
 * package's semver contract — additions and changes may happen in any minor
 * release. If you need to write a custom entity factory or wrap an alternative
 * adapter, file an issue describing your use case before reaching for deep
 * imports.
 */

export type { ITableAdapter } from './lib/adapter/index.js';
