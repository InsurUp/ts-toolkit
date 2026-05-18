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

export async function waitForIdle(table: StatefulTable): Promise<void> {
  await waitFor(() => {
    const state = table.getState();
    return !state.isFetching && !state.isLoading;
  });
}

export async function waitForFetchCycle(
  table: StatefulTable,
  startWindowMs = 1_000
): Promise<void> {
  const start = Date.now();
  while (!table.getState().isFetching) {
    if (Date.now() - start > startWindowMs) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await waitForIdle(table);
}
