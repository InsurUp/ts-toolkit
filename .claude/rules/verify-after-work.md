# Verify After Work

After completing any code-writing task — feature, bug fix, refactor, test addition — run **all** of these from the repo root and confirm each is clean before reporting the work done:

```bash
bun run typecheck
bun run lint
bun run format:check
bun run build
bun run test
```

These are the same checks CI runs. Skipping any of them just defers the failure.

## Order and intent

| Step                   | Purpose                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `bun run typecheck`    | All packages type-clean (`tsc --noEmit`).                                                                                 |
| `bun run lint`         | ESLint across every package.                                                                                              |
| `bun run format:check` | Prettier conformance. If it fails, run `bun run format` and re-check.                                                     |
| `bun run build`        | tsup / svelte-package for every buildable package — catches issues `tsc --noEmit` misses (e.g. circular runtime imports). |
| `bun run test`         | Mocked unit + integration suites. Does **not** include `test/e2e/**` per package.                                         |

## E2E suites (`bun run test:e2e` per package)

E2E suites hit the live InsurUp API and require `INSURUP_E2E_CLIENT_ID` / `INSURUP_E2E_CLIENT_SECRET` in the repo-root `.env`. They are **not** part of the default verification cycle:

- They cost real API calls.
- They skip silently when creds are absent, so a green run without `.env` proves nothing.
- Run them explicitly when changes affect the SDK-facing path (adapter wire-up, fetch options, framework reactivity).

## Rules for failures

- A failure is a stop sign. Do not report work as done until every check passes.
- Format issues: fix with `bun run format`, then re-run `format:check`.
- Type or lint errors: fix the root cause — never suppress (see `no-suppress-errors.md`).
- Build failures: investigate, don't paper over with config tweaks.
- Test failures: read the diff and the failing assertion; the test is usually right.

## What this is not

- This is not a substitute for thinking about edge cases the test suite doesn't cover.
- This is not a license to add green-rubber-stamping tests; existing assertions must continue to hold.
- Running the checks does not replace the obligation to verify the change actually does what the user asked for.
