# SDK Tests

Two-tier test layout under `packages/sdk/test/`:

```
test/
  unit/         ← mocked at fetch or HttpTransport boundary
  integration/  ← MSW-backed full-stack tests through DefaultInsurUpClient
  utils/        ← shared test helpers (mock factories, assertion helpers)
  fixtures/     ← typed SDK-side test data (Customer requests/responses)
```

## Running

```bash
bun run test                     # all 263 tests
bun run test:unit                # 159 unit tests
bun run test:integration         # 104 integration tests
bun run test:watch               # vitest watch mode
bun run test:coverage            # generate coverage/ (text + html)
bun run test:coverage:unit       # coverage for unit only
bun run test:coverage:integration  # coverage for integration only
```

## `test/unit/`

Anything mocked at the `HttpTransport` interface or at `globalThis.fetch`. Fast,
deterministic, no network. Includes:

- `result-handling.spec.ts` — pure-function tests of Result-type helpers
- `http-transport.spec.ts`, `graphql-transport.spec.ts` — transport classes against a stubbed `fetch`
- `interceptors-blob.spec.ts` — request/response interceptors and blob downloads
- `client.spec.ts` — `DefaultInsurUpClient` with a mocked HttpTransport
- `customer-graphql.spec.ts` — customer client's GraphQL methods against a stubbed `fetch`
- `customer-flows.spec.ts`, `error-scenarios.spec.ts` — multi-step workflow tests with a mocked HttpTransport

## `test/integration/`

MSW-backed tests that exercise a real `DefaultInsurUpClient` against canned
network responses. Verifies request URLs, headers, bodies, status mapping, and
problem-details parsing.

### Module map

- `config.ts` — `BASE_URL` constant
- `server.ts` — minimal `setupServer` with **no** default handlers, just a catch-all that 404s on any unhandled request so missing mocks fail loudly. Exports the `useMockServer()` lifecycle helper.
- `<entity>.spec.ts` — tests for that entity's client methods. Each test registers its own handler(s) via `server.use(...)` — no global handler registry.
- `customer.spec.ts` + `transport.spec.ts` — split because `transport.spec.ts` covers cross-cutting concerns (headers, problem-details, content negotiation, timeout) that aren't customer-specific.

### Pattern: one handler per test

Each test is self-contained — register the exact handler(s) it needs inside the
test (or a tight `beforeEach`), and assert on what was actually sent and
received:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { DefaultInsurUpClient } from '../../src/client/client';
import { BASE_URL, server, useMockServer } from './server';

useMockServer();

let client: DefaultInsurUpClient;
beforeEach(() => {
  client = new DefaultInsurUpClient({ baseUrl: BASE_URL, timeoutMs: 5000 });
});

describe('WidgetClient', () => {
  it('getWidget embeds id in path and returns parsed widget', async () => {
    server.use(
      http.get(`${BASE_URL}/widgets/:id`, ({ params }) => {
        expect(params.id).toBe('W-1');
        return HttpResponse.json({ id: 'W-1', name: 'Test Widget' });
      })
    );

    const result = await client.widgets.getWidget('W-1');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('W-1');
    }
  });
});
```

The `afterEach` registered by `useMockServer()` calls `server.resetHandlers()`,
so handlers don't leak between tests.

### What a good test asserts

Beyond `result.kind === 'success'`:

- **Path/query/body**: capture the request inside the handler and assert on `params.id`, `request.url`, `await request.json()`.
- **HTTP method**: capture `request.method`, assert against expected verb.
- **Response parsing**: assert that `result.data.someField` matches the canned response.
- **Error mapping**: a 404 response should produce `result.kind === 'server-error'` with `result.type === InsurUpServerErrorType.ResourceNotFound`.

## Shared modules

- `utils/mock-factories.ts` — `MockHttpTransportFactory`, `MockFetchResponseFactory`, `TestDataFactory`
- `utils/test-helpers.ts` — `TestSetupHelper.cleanup()` (call in `beforeEach`), `TestAssertionHelper`, `TestScenarioHelper`, `ContractValidationHelper`, `PerformanceTestHelper`
- `utils/client-test-base.ts` — `ClientTestBase` abstract class, `ClientTestSuiteBuilder` for declarative client test suites, `IntegrationTestHelper.validateClientArchitecture` (type-safe)
- `utils/e2e-helpers.ts` — `MSWHandlerFactory`, `MSWServerHelper`, `E2EAssertionHelper`
- `fixtures/customer.fixtures.ts` — typed SDK-side `customerRequests`/`customerResponses`/`customerResults`

## Guidelines

1. **Use fixtures** instead of inline test data when one exists for the entity.
2. **`TestSetupHelper.cleanup()` in `beforeEach`** for unit tests (clears mocks).
3. **`useMockServer()` at module scope** for integration tests (registers MSW lifecycle).
4. **Strict types**: no `any`, no `@ts-ignore`/`@ts-expect-error`. Use `unknown`, generics, narrowing, or `as const`.
5. **Optional chaining for array indices**: `result.errors[0]?.code` not `result.errors[0].code` (TS `noUncheckedIndexedAccess`).

## Coverage

Run `bun run test:coverage` then open `coverage/index.html`. Current statement
coverage targets: 80% on `src/clients/`, 90% on `src/core/`. The largest
remaining gaps are in `policy.ts`, `proposal.ts`, `case.ts`, and `agentUser.ts`
— methods requiring deep request-type construction (enums, discriminated unions)
that weren't worth the test setup cost given their straightforward
endpoint-routing logic.
