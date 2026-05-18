/**
 * @fileoverview Wait helpers for e2e tests against real APIs.
 */

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

interface StatefulTable {
  getState: () => { isFetching: boolean; isLoading: boolean };
}

/**
 * Wait until a table is no longer loading or fetching.
 *
 * The adapter auto-refetches when pagination, filter, sort, or search changes,
 * so call this after any state mutation that triggers a network request.
 */
export async function waitForIdle(table: StatefulTable): Promise<void> {
  await waitFor(() => {
    const state = table.getState();
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
 * If the action didn't trigger a fetch within the start window, this resolves
 * without error so callers can still assert post-conditions.
 */
export async function waitForFetchCycle(
  table: StatefulTable,
  startWindowMs = 1_000
): Promise<void> {
  const start = Date.now();
  while (!table.getState().isFetching) {
    if (Date.now() - start > startWindowMs) return; // No fetch was triggered.
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await waitForIdle(table);
}
