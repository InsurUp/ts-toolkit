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
  isFetching: boolean;
  isLoading: boolean;
}

/**
 * Svelte's runes expose fields directly (no getState()), so this overload
 * accepts the result object itself and reads its reactive fields each tick.
 */
export async function waitForIdle(table: StatefulTable): Promise<void> {
  await waitFor(() => !table.isFetching && !table.isLoading);
}
