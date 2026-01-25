# InsurUp SDK Web Demo (Vanilla)

A comprehensive vanilla TypeScript web demo for the InsurUp SDK. This demo showcases OAuth2/PKCE authentication, GraphQL queries with pagination, and CRUD operations using only vanilla JavaScript/TypeScript with no framework dependencies.

## Features

- **OAuth2/PKCE Authentication** - Secure browser-based authentication using the authorization code flow with PKCE
- **Customer Management** - List, view, and create customers with GraphQL pagination
- **Policy Management** - Browse policies with filtering and pagination
- **Profile View** - Display current user information (agent user or customer)
- **Dark Mode** - Toggle between light and dark themes
- **Minimal CSS** - Styled with [Pico CSS](https://picocss.com/) for a clean, semantic design

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or later
- An InsurUp account with API access

### Installation

From the repository root:

```bash
# Install dependencies
bun install

# Navigate to the demo
cd packages/sdk/demos/web/vanilla

# Start the development server
bun dev
```

The demo will be available at `http://localhost:3000`.

### Environment Variables

The demo uses sensible defaults but can be configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Development server port |

Configuration can also be overridden in the browser via localStorage. The following keys are supported:

| localStorage Key | Default | Description |
|------------------|---------|-------------|
| `insurup_config.authServer` | `https://auth.insurup.com` | OAuth2 authorization server URL |
| `insurup_config.clientId` | `demo` | OAuth2 client ID |
| `insurup_config.scopes` | `["openid", "profile", "offline_access", "core-api"]` | OAuth2 scopes |
| `insurup_config.apiBaseUrl` | (SDK default) | API base URL override |

## Project Structure

```
src/
├── main.ts              # Application entry point and router setup
├── config.ts            # Configuration management
├── client.ts            # SDK client singleton with token provider
├── auth/
│   ├── index.ts         # Auth module exports
│   ├── oauth.ts         # OAuth2/PKCE flow implementation
│   ├── token-store.ts   # localStorage token persistence
│   └── pkce.ts          # PKCE code verifier/challenge generation
├── components/
│   ├── header.ts        # Navigation bar with auth status
│   ├── toast.ts         # Toast notifications
│   ├── modal.ts         # Modal dialogs
│   ├── pagination.ts    # Cursor-based pagination controls
│   └── loading.ts       # Loading states and spinners
├── pages/
│   ├── home.ts          # Landing page
│   ├── login.ts         # Login page (initiates OAuth)
│   ├── callback.ts      # OAuth callback handler
│   ├── profile.ts       # Current user profile
│   ├── customers/
│   │   ├── list.ts      # Customer list with pagination
│   │   ├── detail.ts    # Customer detail view
│   │   └── create.ts    # Create customer form
│   └── policies/
│       ├── list.ts      # Policy list with filtering
│       └── detail.ts    # Policy detail view
├── utils/
│   ├── router.ts        # Hash-based SPA router
│   ├── dom.ts           # DOM manipulation helpers
│   └── format.ts        # Date/number/string formatters
└── styles/
    └── custom.css       # Custom CSS additions to Pico
```

## Authentication Flow

This demo implements the OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange), which is the recommended flow for browser-based applications:

1. **Login Initiation** - User clicks "Login" button
2. **PKCE Generation** - Generate code verifier and challenge using Web Crypto API
3. **Authorization Request** - Redirect to auth server with PKCE parameters
4. **User Authentication** - User authenticates on the auth server
5. **Callback Handling** - Auth server redirects back with authorization code
6. **Token Exchange** - Exchange code for tokens using code verifier
7. **Token Storage** - Store tokens in localStorage with expiry tracking
8. **Automatic Refresh** - Refresh tokens before expiry using refresh token

### Security Features

- **PKCE** - Prevents authorization code interception attacks
- **State Parameter** - CSRF protection during OAuth flow
- **Secure Storage** - Tokens stored in localStorage (consider secure cookies for production)
- **Token Expiry** - Automatic token refresh with 60-second buffer

## SDK Usage Examples

### Initializing the Client

```typescript
import { DefaultInsurUpClient } from "@insurup/sdk";
import { getAccessToken } from "./auth";

const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});
```

### GraphQL Query with Pagination

```typescript
const res = await client.customers.getCustomers({
  first: 10,
  after: cursor,
  select: ["id", "name", "identityNumber", "primaryEmail", "type"] as const,
});

if (res.isSuccess && res.data) {
  const { nodes, pageInfo, totalCount } = res.data;
  // nodes: Customer[]
  // pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor }
  // totalCount: number
}
```

### REST API Call

```typescript
const res = await client.customers.getCustomer(customerId);

if (res.isSuccess && res.data) {
  const customer = res.data;
  // Use customer data
} else {
  console.error(res.message);
}
```

### Creating a Customer

```typescript
const res = await client.customers.createCustomer({
  type: "Individual",
  firstName: "John",
  lastName: "Doe",
  identityNumber: "12345678901",
  email: "john@example.com",
});

if (res.isSuccess) {
  console.log("Created customer:", res.data?.id);
}
```

## Development

### Available Scripts

```bash
# Start development server with HMR
bun dev

# Start production server
bun start
```

### Adding New Pages

1. Create a new page file in `src/pages/`:

```typescript
// src/pages/my-page.ts
export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <h1>My Page</h1>
    <p>Page content here</p>
  `;
}
```

2. Add the route in `src/main.ts`:

```typescript
const routes: Route[] = [
  // ...existing routes
  {
    path: "/my-page",
    component: () => import("./pages/my-page"),
    title: "My Page",
    protected: true, // requires authentication
  },
];
```

3. Add navigation link in `src/components/header.ts` if needed.

### Styling

This demo uses [Pico CSS](https://picocss.com/), a minimal CSS framework that styles semantic HTML elements without classes. Custom styles are in `src/styles/custom.css`.

Key styling patterns:

- Use semantic HTML elements (`<article>`, `<header>`, `<footer>`, `<nav>`, etc.)
- Use `role="button"` on links that should look like buttons
- Use `aria-busy="true"` for loading states on buttons
- Use `data-theme="dark"` on `<html>` for dark mode

## Browser Compatibility

This demo uses modern browser APIs:

- Web Crypto API (for PKCE)
- ES Modules
- Dynamic imports
- localStorage/sessionStorage

Supported browsers:

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

## License

MIT License - See the repository root for details.
