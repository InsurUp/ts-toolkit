/**
 * @fileoverview Wait helpers for e2e tests against real APIs.
 *
 * `waitForIdle` accepts either shape used across the adapter packages:
 *   - the regular adapter API: `{ getState(): { isFetching, isLoading } }` (core, react, vue)
 *   - Svelte runes: `{ isFetching, isLoading }` exposed directly
 *
 * Real timers only — these helpers will hang under `vi.useFakeTimers()`.
 */

interface StatefulTableViaGetState {
  getState: () => { isFetching: boolean; isLoading: boolean };
}

interface StatefulTableViaFields {
  isFetching: boolean;
  isLoading: boolean;
}

export type StatefulTable = StatefulTableViaGetState | StatefulTableViaFields;

function readState(table: StatefulTable): { isFetching: boolean; isLoading: boolean } {
  return 'getState' in table ? table.getState() : table;
}

export async function waitFor(
  condition: () => boolean,
  timeoutMs = 30_000,
  intervalMs = 50
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Wait until a table is no longer loading or fetching.
 *
 * The adapter auto-refetches when pagination, filter, sort, or search changes,
 * so call this after any state mutation that triggers a network request.
 */
export async function waitForIdle(table: StatefulTable): Promise<void> {
  await waitFor(() => {
    const state = readState(table);
    return !state.isFetching && !state.isLoading;
  });
}

/**
 * Wait for the table to start fetching (up to a short window), then finish.
 *
 * Use after an action that *should* trigger a fetch but where the fetch start
 * is async — e.g. `pagination.next()` schedules a fetch via a subscription
 * callback that fires after the current microtask. Without this two-phase
 * wait, polling for "idle" can return immediately on the pre-fetch state.
 *
 * Throws if no fetch starts within `startWindowMs`. Silent early-return would
 * mask regressions where a state mutation no longer triggers a fetch — the
 * downstream assertions would then run against stale state.
 */
export async function waitForFetchCycle(
  table: StatefulTable,
  startWindowMs = 1_000
): Promise<void> {
  const start = Date.now();
  while (!readState(table).isFetching) {
    if (Date.now() - start > startWindowMs) {
      throw new Error(
        `waitForFetchCycle: no fetch started within ${startWindowMs}ms — ` +
          'expected the preceding action to trigger one'
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await waitForIdle(table);
}
