# InsurUp SDK Web Demo (MPA / Vanilla TypeScript)

A Multi-Page Application demo for the InsurUp SDK built with vanilla TypeScript. Unlike Single-Page Applications, this demo uses separate HTML files for each page with traditional navigation.

## Features

- **OAuth2/PKCE Authentication** - Secure browser-based authentication
- **Customer Management** - List, view, and create customers with pagination
- **Policy Management** - Browse policies with filtering and pagination
- **Multi-Page Architecture** - Each page is a separate HTML file
- **No Framework** - Pure TypeScript with no React/Vue/Svelte
- **Bun Bundler** - Fast on-demand bundling during development

## Tech Stack

| Technology                                    | Purpose                          |
| --------------------------------------------- | -------------------------------- |
| [Bun](https://bun.sh/)                        | Runtime, bundler, and dev server |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript             |
| [Pico CSS](https://picocss.com/)              | Minimal CSS framework            |
| [@insurup/sdk](../../../../README.md)         | InsurUp API client               |

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
cd packages/sdk/demos/web/mpa/vanilla/ts

# Start the development server
bun dev
```

The demo will be available at `http://localhost:3001`.

## Project Structure

```
mpa/vanilla/ts/
├── package.json
├── tsconfig.json
├── server.ts                    # Bun dev server with on-demand bundling
├── public/
│   ├── index.html               # Home page
│   ├── login.html               # Login page
│   ├── callback.html            # OAuth callback
│   ├── profile.html             # User profile
│   ├── customers/
│   │   ├── index.html           # Customer list
│   │   ├── detail.html          # Customer detail (?id=xxx)
│   │   └── create.html          # Create customer form
│   ├── policies/
│   │   ├── index.html           # Policy list
│   │   └── detail.html          # Policy detail (?id=xxx)
│   └── css/
│       └── custom.css           # Custom styles
├── src/
│   ├── shared/
│   │   ├── auth.ts              # OAuth/PKCE + token management
│   │   ├── client.ts            # SDK client singleton
│   │   ├── config.ts            # Configuration
│   │   ├── format.ts            # Formatters
│   │   └── components.ts        # Shared UI components
│   └── pages/
│       ├── home.ts              # Home page entry
│       ├── login.ts             # Login page entry
│       ├── callback.ts          # OAuth callback handler
│       ├── profile.ts           # Profile page entry
│       ├── customers-list.ts    # Customer list entry
│       ├── customers-detail.ts  # Customer detail entry
│       ├── customers-create.ts  # Create customer entry
│       ├── policies-list.ts     # Policy list entry
│       └── policies-detail.ts   # Policy detail entry
└── README.md
```

## How It Works

### Multi-Page vs Single-Page Architecture

| Aspect       | MPA (This Demo)            | SPA                        |
| ------------ | -------------------------- | -------------------------- |
| Navigation   | Full page reload           | Client-side routing        |
| URLs         | Real paths (`/customers/`) | Hash-based (`#/customers`) |
| Entry Points | One per page               | Single entry               |
| Initial Load | Faster per page            | Larger initial bundle      |
| SEO          | Better                     | Requires SSR               |

### Development Server

The dev server (`server.ts`) bundles TypeScript on-demand:

1. Each HTML page references a `.bundle.js` file
2. When requested, the server bundles the corresponding TypeScript entry
3. Bundles are cached and invalidated on file changes

### Page Entry Pattern

Each page has:

1. An HTML file in `public/`
2. A TypeScript entry in `src/pages/`

The entry point initializes the page:

```typescript
// src/pages/customers-list.ts
import { loadConfig } from '../shared/config';
import { renderHeader, initTheme } from '../shared/components';
import { requireAuth } from '../shared/auth';

async function init() {
  loadConfig();
  initTheme();
  await requireAuth(); // Refreshes token if needed, redirects to login if not authenticated

  renderHeader(document.getElementById('main-nav')!);
  await loadCustomers(document.getElementById('main-content')!);
}

init();
```

## SDK Usage Examples

### Initializing the Client

```typescript
import { getClient } from '../shared/client';

const client = getClient();
```

### Fetching Data with Pagination

```typescript
const res = await client.customers.getCustomers({
  first: 10,
  after: cursor,
  select: ['id', 'name', 'identityNumber', 'primaryEmail'] as const,
});

if (res.isSuccess && res.data) {
  const { nodes, pageInfo, totalCount } = res.data;
}
```

### Creating a Resource

```typescript
const res = await client.customers.createCustomer({
  type: 'Individual',
  firstName: 'John',
  lastName: 'Doe',
  identityNumber: '12345678901',
});

if (res.isSuccess) {
  window.location.href = `/customers/detail.html?id=${res.data?.id}`;
}
```

## Configuration

Configuration can be overridden in localStorage:

| Key                         | Default                    | Description       |
| --------------------------- | -------------------------- | ----------------- |
| `insurup_config.authServer` | `https://auth.insurup.com` | OAuth2 server URL |
| `insurup_config.clientId`   | `demo`                     | OAuth2 client ID  |
| `insurup_config.apiBaseUrl` | (SDK default)              | API base URL      |

## Comparison with SPA Demo

See also: [SPA Demo](../../spa/vanilla/ts/README.md)

This MPA demo is better for:

- Understanding traditional web architecture
- SEO-sensitive applications
- Simpler mental model (one page = one file)

The SPA demo is better for:

- App-like navigation experience
- Complex client-side state
- Avoiding full page reloads

## License

MIT License - See the repository root for details.
