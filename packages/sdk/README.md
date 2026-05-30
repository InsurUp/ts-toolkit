# InsurUp TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@insurup/sdk.svg)](https://www.npmjs.com/package/@insurup/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Type-safe TypeScript SDK for the InsurUp insurance platform with GraphQL support. Tree-shakeable and runtime-agnostic — runs on Node, Bun, Deno, browsers, and edge.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Architecture](#architecture)
- [Result Handling](#result-handling)
- [GraphQL Queries](#graphql-queries)
- [Configuration](#configuration)
- [Interceptors](#interceptors)
- [API Clients](#api-clients)
- [Compatibility](#compatibility)
- [License](#license)

---

## Installation

```bash
npm install @insurup/sdk
```

```bash
pnpm add @insurup/sdk
```

```bash
yarn add @insurup/sdk
```

---

## Quick Start

```typescript
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});

const result = await client.customers.getCustomer('customer-id');

if (result.isSuccess) {
  console.log(result.data);
}
```

---

## Authentication

The SDK ships an auth module for OAuth 2.0 / OIDC login, token storage, and transparent refresh. `createInsurUpAuth()` returns an `InsurUpAuth` handle; pass it to the client as `auth` and tokens are injected into every HTTP and SignalR request automatically.

```typescript
import { createInsurUpAuth, DefaultInsurUpClient } from '@insurup/sdk';

const auth = createInsurUpAuth({ clientId, clientSecret });
const login = await auth.loginWithClientCredentials();
if (!login.isSuccess) throw login.error; // or handle login.error (an OAuthError)

const client = new DefaultInsurUpClient({ auth }); // tokens flow automatically
```

Passing `auth` wires `auth.tokenProvider` into the client. An explicit `tokenProvider` always takes precedence, so you can still bring your own tokens.

The imperative flows — `loginWithClientCredentials`, `exchangeCode`, and `refresh` — return an **`AuthResult<OAuthTokens>`**: the same `isSuccess` / `kind` discriminated union the rest of the SDK uses (a failure carries `error`, an `OAuthError`), so you branch on results instead of `try`/`catch`. `getAccessToken()` stays `string | null`.

### Client credentials (server-to-server)

For backend services and scripts. Requires a `clientSecret` — **never ship a secret to a browser.**

```typescript
const auth = createInsurUpAuth({
  clientId: process.env.INSURUP_CLIENT_ID!,
  clientSecret: process.env.INSURUP_CLIENT_SECRET!,
  scopes: ['core-api'],
});

const login = await auth.loginWithClientCredentials();
// or override per call: auth.loginWithClientCredentials({ scopes: ['core-api', 'reports'] })
if (!login.isSuccess) throw login.error;

const client = new DefaultInsurUpClient({ auth });
```

> The client credentials grant does not issue a refresh token. When the access token expires the session is cleared and `getAccessToken()` returns `null` — call `loginWithClientCredentials()` again to acquire a fresh one. See [Token lifecycle](#token-lifecycle).

### Authorization code + PKCE (browser / public clients)

No client secret. Redirect the user to the authorization server, then exchange the returned code.

```typescript
const auth = createInsurUpAuth({
  clientId: 'spa-client',
  authServer: 'https://auth.insurup.com', // endpoints resolved via OIDC discovery
  storage: localStorageTokenStorage(), // persist across reloads (see Token storage)
});

// 1. Build the authorize URL and send the user there
const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
  redirectUri: 'https://app.example.com/callback',
  scopes: ['openid', 'offline_access', 'core-api'], // offline_access → refresh token
});
sessionStorage.setItem('insurup.pkce', JSON.stringify({ codeVerifier, state }));
window.location.assign(url);

// 2. On the callback page, exchange the code for tokens
const { codeVerifier, state } = JSON.parse(sessionStorage.getItem('insurup.pkce')!);
const result = await auth.exchangeCode({
  callbackUrl: window.location.href, // ?code & ?state are parsed out of it
  redirectUri: 'https://app.example.com/callback',
  codeVerifier,
  state,
});
if (!result.isSuccess) throw result.error;

const client = new DefaultInsurUpClient({ auth });
```

#### Pushed Authorization Requests (PAR)

Set `usePAR: true` to use [RFC 9126](https://www.rfc-editor.org/rfc/rfc9126) instead of a standard authorize URL. The request parameters (`scope`, `code_challenge`, `state`, `redirect_uri`, `extraParams`, …) are POSTed to the server's `pushed_authorization_request_endpoint` over a back-channel call, and the returned `url` carries only `client_id` + a one-shot `request_uri` — keeping the parameters out of the user-visible redirect, browser history, and server logs.

```typescript
const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
  redirectUri: 'https://app.example.com/callback',
  scopes: ['openid', 'offline_access', 'core-api'],
  usePAR: true, // ← push params; url is just ?client_id=…&request_uri=…
});
```

The rest of the flow (persist `codeVerifier`/`state`, redirect, then `exchangeCode`) is unchanged. PAR needs the server to advertise the endpoint via OIDC discovery; with explicit endpoints, set `pushedAuthorizationRequestEndpoint` in the config. If `usePAR` is set but no endpoint is available, `getAuthorizeUrl()` throws an `OAuthError` rather than silently falling back. For confidential clients the push is authenticated with `clientSecret`.

### Token storage

By default tokens are held in memory and lost on restart/reload. Provide a `TokenStorage` (`get` / `set` / `clear`, sync or async) to persist them — e.g. browser `localStorage`:

```typescript
import type { TokenStorage, OAuthTokens } from '@insurup/sdk';

function localStorageTokenStorage(key = 'insurup.tokens'): TokenStorage {
  return {
    get: () => {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as OAuthTokens) : null;
    },
    set: (tokens) => localStorage.setItem(key, JSON.stringify(tokens)),
    clear: () => localStorage.removeItem(key),
  };
}
```

The same shape works for a keychain, an encrypted file, or an edge KV store. The in-memory default is also exported as `createMemoryTokenStorage()`.

> **Serverless / edge:** in-memory storage does not survive between invocations (each request may run in a fresh isolate), so tokens are re-fetched every time. Back `TokenStorage` with a shared store (KV, Durable Object, Redis, cookie) to persist sessions across requests.

#### Multi-tenant servers (per-request context)

`TokenStorage`, `InsurUpAuth`, and `InsurUpClientOptions` take an optional `TContext` type parameter so one process can serve many users. It defaults to `void` — single-session code (everything above) is unaffected. Specify a non-`void` context (e.g. `{ sessionId: string }`) and it is threaded through every storage read/write and every auth method, so the SDK knows _which_ session each call belongs to:

```typescript
type Ctx = { sessionId: string };

const store = new Map<string, OAuthTokens>(); // your real store: Redis, DB, KV…
const storage: TokenStorage<Ctx> = {
  get: (ctx) => (ctx ? (store.get(ctx.sessionId) ?? null) : null),
  set: (tokens, ctx) => void (ctx && store.set(ctx.sessionId, tokens)),
  clear: (ctx) => void (ctx && store.delete(ctx.sessionId)),
};

// TContext is inferred from the storage you pass.
const auth = createInsurUpAuth<Ctx>({ clientId, clientSecret, storage });

// Login mints the session, then writes tokens under it (no instance per user):
const result = await auth.exchangeCode({
  callbackUrl,
  redirectUri,
  codeVerifier,
  state,
  context: { sessionId }, // ← tokens stored under this session
});

// Every storage-touching method takes the context:
await auth.getAccessToken({ sessionId });
await auth.refresh({ sessionId });
await auth.logout({ sessionId });

// Bind a session once per request; the client threads it through every call:
const client = new DefaultInsurUpClient({ auth, authContext: { sessionId } });
```

Each session's tokens stay isolated, and concurrent refreshes are de-duped per refresh token (so two sessions never share a refresh). The context is optional at the type level, so a multi-tenant caller that forgets to pass it gets an `undefined` context at runtime rather than a compile error — pass it on every storage-touching call. `getState()`/`subscribe()` remain single-session reactive helpers; multi-tenant servers read per-session state from their store.

### Token lifecycle

Refresh is automatic — `tokenProvider` calls `getAccessToken()`, which refreshes when the token is within `refreshBufferSeconds` (default **60s**) of expiry, de-duping concurrent refreshes into a single request. You rarely need these directly:

```typescript
await auth.getAccessToken(); // valid token (refreshing if needed) or null
await auth.refresh(); // force a refresh → AuthResult (failure if no refresh token)
await auth.getTokens(); // raw stored tokens (may be expired) or null
await auth.logout(); // clear the session
auth.getState(); // sync { isAuthenticated, tokens }
```

If a refresh fails — or an access token expires with no refresh token available — the session is cleared and `getAccessToken()` returns `null`.

### Reactive state

`subscribe` + `getState` plug straight into `useSyncExternalStore` (React) or a store (Vue/Svelte):

```typescript
const unsubscribe = auth.subscribe((state) => {
  render(state.isAuthenticated ? 'Signed in' : 'Signed out');
});
```

### Error handling

Login, exchange, and refresh failures come back as the failure branch of `AuthResult` — no `try`/`catch`. The carried `error` is a typed `OAuthError`:

```typescript
const result = await auth.loginWithClientCredentials();
if (!result.isSuccess) {
  const { code, description, status } = result.error; // OAuthError
  console.error(code, description, status); // e.g. 'invalid_client', …, 401
}
```

> `getAuthorizeUrl()` is the exception — it builds a URL and **throws** an `OAuthError` on a configuration problem (e.g. no authorization endpoint), rather than returning a result.

### Runtime support

The auth module imports no Node built-ins — it runs on any platform with the Fetch API and Web Crypto (`crypto.subtle`): Node 18+, Bun, Deno, modern browsers, and edge runtimes (Cloudflare Workers, Vercel Edge). On stateless runtimes, supply a persistent `TokenStorage` (see [Token storage](#token-storage)).

---

## Architecture

```mermaid
graph TB
    subgraph SDK[DefaultInsurUpClient]
        direction TB
        HTTP[HttpTransport]
        GQL[GraphQLTransport]

        subgraph Clients[Specialized Clients]
            direction LR
            C1[customers]
            C2[policies]
            C3[proposals]
            C4[vehicles]
            C5[properties]
            C6[coverage]
            C7[cases]
            C8[agents]
            C9[webhooks]
            C10[...]
        end
    end

    App[Your Application] --> SDK
    HTTP --> API[InsurUp REST API]
    GQL --> GQLAPI[InsurUp GraphQL API]
    Clients --> HTTP
    Clients --> GQL
```

The SDK uses a **compositional architecture**:

- `DefaultInsurUpClient` aggregates 18 specialized clients
- All clients share `HttpTransport` and `GraphQLTransport` instances
- GraphQL queries support filtering, searching, sorting, and type-safe field selection
- Request/response interceptors hook into the transport layer
- Results use discriminated unions for type-safe error handling

---

## Result Handling

Every API call returns an `InsurUpResult<T>` — a discriminated union that's either a success or an error:

```typescript
const result = await client.customers.getCustomer('id');

// Pattern 1: Boolean check
if (result.isSuccess) {
  console.log(result.data); // fully typed
} else {
  console.error(result.message);
}

// Pattern 2: Switch on kind
switch (result.kind) {
  case 'success':
    return result.data;
  case 'server-error':
    throw new Error(`${result.type}: ${result.message}`);
  case 'client-error':
    throw new Error(`Network error: ${result.message}`);
}

// Pattern 3: Throw on error
import { getDataOrThrow } from '@insurup/sdk';

const customer = getDataOrThrow(await client.customers.getCustomer('id'));
```

### Error Types

| Kind           | Types                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `server-error` | `Unauthorized`, `AccessDenied`, `ResourceNotFound`, `InputValidation`, `BusinessValidation`, `Upstream` |
| `client-error` | `Timeout`, `HttpRequestFailed`, `JsonDeserialization`, `NullResponse`                                   |

---

## GraphQL Queries

The SDK includes built-in GraphQL support for querying entities with advanced filtering, searching, sorting, and type-safe field selection.

### Available GraphQL Methods

| Client       | Method                     | Description                       |
| ------------ | -------------------------- | --------------------------------- |
| `customers`  | `getCustomers()`           | Query customers with filters      |
| `policies`   | `getPolicies()`            | Query policies with filters       |
| `policies`   | `getPolicyTransfers()`     | Query policy transfers            |
| `policies`   | `getFilePolicyTransfers()` | Query file-based policy transfers |
| `proposals`  | `getProposals()`           | Query proposals with filters      |
| `cases`      | `getCases()`               | Query cases with filters          |
| `agentUsers` | `getAgentUsers()`          | Query agent users with filters    |
| `webhooks`   | `getWebhookDeliveries()`   | Query webhook deliveries          |

### Basic Usage

```typescript
// Query with pagination
const result = await client.customers.getCustomers({
  first: 10,
  after: 'cursor-string',
});

if (result.isSuccess) {
  console.log(result.data.nodes); // Customer[]
  console.log(result.data.totalCount); // Total count
  console.log(result.data.pageInfo); // Pagination info
}
```

### Type-Safe Field Selection

Select only the fields you need — the return type automatically narrows:

```typescript
const result = await client.policies.getPolicies({
  select: ['id', 'productBranch', 'grossPremium', 'state'] as const,
  first: 10,
});

// result.data.nodes[0] is typed as:
// { id: string; productBranch: ProductBranch; grossPremium: number | null; state: PolicyState }
```

### Filtering and Searching (unified)

Every list query takes a single `filter:` field carrying the **unified** input shape. Each per-field entry is either a plain filter operator or, with a `$search: true` marker, a search clause. The SDK splits the unified input into the server's `filter:` and `search:` slots at request time.

Operator names match the wire (`notContains`, `notStartsWith`, `notEndsWith`). Search-side text ops (`textSearch`, `wildcard`, `autocomplete`, etc.) take both `string` shorthand and `{ value, score? }` long form; `in`/`nin` take `string[]` shorthand or `{ values, score? }`.

```typescript
import { CustomerType, ProductBranch } from '@insurup/sdk';

// 1. Pure filter — every entry without `$search: true` routes to the wire filter slot
const filtered = await client.policies.getPolicies({
  first: 20,
  filter: {
    productBranch: { eq: ProductBranch.Traffic },
    grossPremium: { gte: 1000 },
    insuredCustomerName: { notContains: 'TEST' },
  },
});

// 2. Pure search — `$search: true` promotes a field, unlocking search-only operators
const searched = await client.customers.getCustomers({
  first: 10,
  filter: {
    // Shorthand string — SDK normalizes to { value: 'John' }
    name: { $search: true, textSearch: 'John' },
  },
});

// 3. Mixed — splits across both wire slots in one call
const both = await client.customers.getCustomers({
  first: 20,
  filter: {
    type: { eq: CustomerType.Individual }, // → wire `filter:`
    name: { $search: true, textSearch: 'John' }, // → wire `search:`
    identityNumber: { $search: true, in: ['123', '456'] }, // → wire `search:` (string[] shorthand)
  },
});

// 4. Relevance score boost / constant — long-form SearchTextInput
const boosted = await client.customers.getCustomers({
  first: 10,
  filter: {
    name: { $search: true, textSearch: { value: 'John', score: { boost: 2 } } },
    primaryEmail: { $search: true, contains: { value: '@acme.com', score: { constant: 5 } } },
  },
});

// 5. Combinators — and/or recursively
const compound = await client.customers.getCustomers({
  first: 20,
  filter: {
    and: [
      { type: { eq: CustomerType.Individual } },
      { name: { $search: true, textSearch: 'John' } },
    ],
  },
});
```

The `$search` marker is type-checked: it's only allowed on fields the server actually exposes as searchable. Marking a filter-only field is a compile error, as is using a search-only operator (like `textSearch`) without the marker.

> If you're consuming the **table adapter** (`@insurup/table-adapter-core`), `setFilter` takes the exact same unified shape. The adapter forwards it to the SDK as-is; the SDK does the split.

### Sorting

```typescript
import { SortEnumType } from '@insurup/sdk';

const result = await client.cases.getCases({
  first: 20,
  order: [{ priorityScore: SortEnumType.Desc }, { createdAt: SortEnumType.Desc }],
});
```

---

## Configuration

```typescript
const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com/api/',
  tokenProvider: () => getAccessToken(),
  timeoutMs: 30000,
  customHeaders: { 'X-Request-Source': 'my-app' },
  retry: { retries: 3, backoffStrategy: 'exponential' },
  onRequest: (config) => config,
  onResponse: (result, config) => result,
});
```

| Option          | Type                              | Default                        | Description              |
| --------------- | --------------------------------- | ------------------------------ | ------------------------ |
| `baseUrl`       | `string`                          | `https://api.insurup.com/api/` | API base URL             |
| `tokenProvider` | `() => string \| Promise<string>` | —                              | OAuth token provider     |
| `timeoutMs`     | `number`                          | `30000`                        | Request timeout          |
| `customHeaders` | `Record<string, string>`          | —                              | Headers for all requests |
| `retry`         | `RetryOptions`                    | —                              | Retry configuration      |
| `onRequest`     | `RequestInterceptor`              | —                              | Pre-request hook         |
| `onResponse`    | `ResponseInterceptor`             | —                              | Post-response hook       |

---

## Interceptors

Add logging, correlation IDs, or transform requests/responses:

```typescript
const client = new DefaultInsurUpClient({
  tokenProvider: () => token,

  onRequest: (config) => {
    console.log(`→ ${config.method} ${config.url}`);
    return {
      ...config,
      headers: { ...config.headers, 'X-Correlation-ID': crypto.randomUUID() },
    };
  },

  onResponse: (result, config) => {
    console.log(`← ${config.url} ${result.isSuccess ? '✓' : '✗'}`);
    return result;
  },
});
```

---

## API Clients

Access specialized clients through the main client instance:

| Client                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `client.customers`     | Customer profiles, contact info, health data |
| `client.policies`      | Policy details, documents, representatives   |
| `client.proposals`     | Insurance proposals, comparisons, purchasing |
| `client.vehicles`      | Vehicle data, brand/model lookups            |
| `client.properties`    | Property data, DASK earthquake insurance     |
| `client.coverage`      | Coverage configuration, coverage groups      |
| `client.cases`         | Service requests, claims, complaints         |
| `client.agents`        | Agent profiles, company connections          |
| `client.agentBranches` | Branch management                            |
| `client.agentRoles`    | Role-based access control                    |
| `client.agentUsers`    | Agency staff management                      |
| `client.agentSetup`    | Agent onboarding                             |
| `client.webhooks`      | Event notifications, integrations            |
| `client.oauthClients`  | OAuth client management, redirect URIs       |
| `client.insurance`     | Companies, products, resource keys           |
| `client.files`         | File uploads and management                  |
| `client.languages`     | Localization support                         |
| `client.templates`     | Document and email templates                 |

---

## Compatibility

| Environment | Support                                       |
| ----------- | --------------------------------------------- |
| Node.js     | 18+                                           |
| Browsers    | ES2022+ (Chrome 94+, Firefox 93+, Safari 15+) |
| Bun         | ✓                                             |
| Deno        | ✓                                             |

Dual ESM/CJS builds included. Full tree-shaking support.

---

## License

[MIT](LICENSE)
