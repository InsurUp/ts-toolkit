# InsurUp SDK CLI Demo

Interactive CLI demo showcasing the InsurUp SDK with OAuth2/OIDC authentication.

## Features Demonstrated

- **OAuth2/PKCE Authentication**: Secure login flow with PKCE, CSRF protection, and token refresh
- **Credential Storage**: Secure token persistence using Bun.secrets
- **SDK Client Usage**: Dynamic token provider pattern for automatic token refresh
- **GraphQL Pagination**: Cursor-based pagination with the SDK
- **Error Handling**: Proper error handling patterns with the SDK response types

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- InsurUp account with API access

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Run the interactive CLI:

```bash
bun start
```

3. Select "Login" to authenticate via browser

## Environment Variables

| Variable              | Description                     | Default                                  |
| --------------------- | ------------------------------- | ---------------------------------------- |
| `INSURUP_AUTH_SERVER` | OAuth2 authorization server URL | `https://auth.insurup.com`               |
| `INSURUP_CLIENT_ID`   | OAuth2 client ID                | `demo`                                   |
| `INSURUP_SCOPES`      | Comma-separated OAuth2 scopes   | `openid,profile,offline_access,core-api` |
| `INSURUP_API_URL`     | API base URL (optional)         | SDK default                              |
| `INSURUP_ENV`         | Environment name for display    | `production`                             |

## Available Actions

| Action               | Description                                    |
| -------------------- | ---------------------------------------------- |
| **Login**            | Authenticate via OAuth2/OIDC browser flow      |
| **Logout**           | Clear stored credentials                       |
| **Status**           | Show authentication and config status          |
| **Get current user** | Fetch your user profile from the API           |
| **List customers**   | Browse customers with pagination               |
| **Create customer**  | Create a new customer with interactive prompts |

## Project Structure

```
src/
├── index.ts          # Main CLI entry point
├── client.ts         # Shared SDK client instance
├── config.ts         # Environment configuration
├── pagination.ts     # Cursor pagination helper
├── auth/
│   ├── index.ts          # Auth module exports
│   ├── oauth.ts          # OAuth2 flow orchestration
│   ├── credential-store.ts   # Token persistence
│   └── callback-server.ts    # OAuth callback handler
└── actions/
    ├── index.ts          # Action registry
    ├── login.ts          # Login action
    ├── logout.ts         # Logout action
    ├── status.ts         # Status action
    ├── get-current-user.ts   # Get user action
    ├── list-customers.ts     # List customers action
    └── create-customer.ts    # Create customer action
```

## SDK Usage Examples

### Creating the Client

```typescript
import { DefaultInsurUpClient } from '@insurup/sdk';
import { getAccessToken } from './auth';

// Dynamic token provider handles auto-refresh
const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});
```

### Making API Calls

```typescript
// Get current user
const res = await client.agentUsers.getMyAgentUser();

if (res.isSuccess) {
  console.log('User:', res.data);
} else {
  console.log('Error:', res.message);
}
```

### Paginated Queries

```typescript
const res = await client.customers.getCustomers({
  first: 10,
  after: cursor,
  select: ['id', 'name', 'type'] as const,
});

if (res.isSuccess) {
  for (const customer of res.data.nodes) {
    console.log(customer.name);
  }

  if (res.data.pageInfo.hasNextPage) {
    // Fetch next page with res.data.pageInfo.endCursor
  }
}
```

## Development

Run with hot reload:

```bash
bun dev
```

## Programmatic Usage

You can also use the auth module programmatically after logging in via the CLI:

```bash
bun index.ts
```

This will use the stored credentials to make a simple API call.
