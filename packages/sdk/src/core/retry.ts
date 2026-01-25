/**
 * @fileoverview Lightweight retry utility for transient failure handling
 * @description Provides configurable backoff strategies with jitter, zero-dependency replacement for p-retry
 */

import type { RetryOptions } from "./options.js";

/**
 * Executes a function with configurable backoff retry logic
 * @template T The return type of the function
 * @param fn The function to execute, receives attempt number (1-based)
 * @param options Retry configuration options
 * @returns Promise resolving to the function's result
 * @throws The last error encountered if all retry attempts fail
 */
export async function withRetry<T>(
  fn: (attemptNumber: number) => Promise<T>,
  options: Required<RetryOptions>,
): Promise<T> {
  const {
    retries,
    factor,
    minTimeout,
    maxTimeout,
    randomize,
    backoffStrategy,
    onFailedAttempt,
  } = options;

  let attempt = 1;

  while (true) {
    try {
      return await fn(attempt);
    } catch (error) {
      const isLastAttempt = attempt > retries;

      if (isLastAttempt) {
        throw error;
      }

      // Calculate delay based on backoff strategy
      let delay: number;
      switch (backoffStrategy) {
        case "linear":
          delay = minTimeout * attempt;
          break;
        case "constant":
          delay = minTimeout;
          break;
        case "exponential":
        default:
          delay = minTimeout * Math.pow(factor, attempt - 1);
      }

      // Apply jitter if enabled
      if (randomize) {
        // Random factor between 1 and 2, matching p-retry behavior
        delay *= 1 + Math.random();
      }

      // Cap at maxTimeout
      delay = Math.min(delay, maxTimeout);

      // Notify callback
      if (onFailedAttempt) {
        onFailedAttempt({
          attemptNumber: attempt,
          retriesLeft: retries - attempt + 1,
          name: error instanceof Error ? error.name : "Error",
          message: error instanceof Error ? error.message : String(error),
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));

      attempt++;
    }
  }
}
