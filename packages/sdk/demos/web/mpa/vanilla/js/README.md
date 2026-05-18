# InsurUp SDK Web Demo (MPA / Vanilla JavaScript)

A Multi-Page Application demo for the InsurUp SDK using **plain JavaScript** with no build step required. This is the simplest possible way to use the SDK in a browser.

## Features

- **No Build Step** - Edit files and refresh the browser
- **Plain JavaScript** - ES modules with JSDoc type hints
- **OAuth2/PKCE Authentication** - Secure browser-based auth
- **Customer Management** - List, view, and create customers
- **Policy Management** - Browse policies with filtering
- **Import Maps** - Native browser feature for module resolution

## Tech Stack

| Technology                            | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| JavaScript (ES2020+)                  | Application code                    |
| [Bun](https://bun.sh/)                | Simple static file server           |
| [Pico CSS](https://picocss.com/)      | Minimal CSS framework               |
| [@insurup/sdk](../../../../README.md) | InsurUp API client (browser bundle) |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or later (for the dev server)
- An InsurUp account with API access
- SDK packages must be built first (see below)

### Installation

From the repository root:

```bash
# Install dependencies and build packages
bun install
bun run build  # Builds SDK and contracts browser bundles

# Navigate to the demo
cd packages/sdk/demos/web/mpa/vanilla/js

# Start the development server
bun dev
```

The demo will be available at `http://localhost:3002`.

## Project Structure

```
mpa/vanilla/js/
├── package.json             # Minimal - just for dev server
├── server.js                # Simple static file server
├── index.html               # Home page
├── login.html               # Login page
├── callback.html            # OAuth callback
├── profile.html             # User profile
├── customers/
│   ├── index.html           # Customer list
│   ├── detail.html          # Customer detail
│   └── create.html          # Create customer
├── policies/
│   ├── index.html           # Policy list
│   └── detail.html          # Policy detail
├── js/
│   ├── shared/
│   │   ├── auth.js          # OAuth/PKCE
│   │   ├── client.js        # SDK client
│   │   ├── config.js        # Configuration
│   │   ├── format.js        # Formatters
│   │   └── components.js    # Shared UI
│   └── pages/
│       ├── home.js
│       ├── login.js
│       ├── callback.js
│       ├── profile.js
│       ├── customers-list.js
│       ├── customers-detail.js
│       ├── customers-create.js
│       ├── policies-list.js
│       └── policies-detail.js
├── css/
│   └── custom.css
└── README.md
```

## How It Works

### Import Maps

Each HTML page includes an import map that maps the SDK package to its browser bundle:

```html
<script type="importmap">
  {
    "imports": {
      "@insurup/sdk": "../../../dist/index.browser.js",
      "@insurup/contracts": "../../../../contracts/dist/index.browser.js"
    }
  }
</script>
<script type="module" src="/js/pages/home.js"></script>
```

This allows JavaScript files to use familiar imports:

```javascript
import { DefaultInsurUpClient } from '@insurup/sdk';
import { PolicyState } from '@insurup/contracts';
```

### No Build Required

- Edit any `.js` file
- Refresh the browser
- Changes are immediately visible

This is possible because:

1. Modern browsers support ES modules natively
2. Import maps handle package resolution
3. The SDK provides a pre-built browser bundle

### JSDoc Type Hints

While plain JavaScript, the code uses JSDoc comments for type hints:

```javascript
/**
 * @param {string} customerId
 * @returns {Promise<Object>}
 */
async function loadCustomer(customerId) {
  const client = getClient();
  const res = await client.customers.getCustomer(customerId);
  return res.data;
}
```

This provides IDE autocomplete and type checking (in VS Code with `// @ts-check`).

## SDK Usage Examples

### Initializing the Client

```javascript
import { DefaultInsurUpClient } from '@insurup/sdk';
import { getAccessToken } from './auth.js';

const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});
```

### Fetching Data

```javascript
const res = await client.customers.getCustomers({
  first: 10,
  select: ['id', 'name', 'identityNumber'],
});

if (res.isSuccess) {
  console.log(res.data.nodes);
}
```

### Using Enums

```javascript
import { PolicyState } from '@insurup/contracts';

if (policy.state === PolicyState.Active) {
  console.log('Policy is active');
}
```

## Browser Compatibility

This demo requires browsers that support:

- ES Modules (`<script type="module">`)
- Import Maps (`<script type="importmap">`)
- Web Crypto API (for PKCE)

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 89+             |
| Firefox | 108+            |
| Safari  | 16.4+           |
| Edge    | 89+             |

## Comparison with Other Demos

| Feature     | JS (This)   | TS          | SPA         |
| ----------- | ----------- | ----------- | ----------- |
| Build Step  | None        | Bun         | Bun         |
| Language    | JavaScript  | TypeScript  | TypeScript  |
| Type Safety | JSDoc       | Full        | Full        |
| Navigation  | Page reload | Page reload | Client-side |
| Complexity  | Lowest      | Medium      | Highest     |

Choose this demo if you want:

- The simplest possible setup
- Quick prototyping
- Learning the SDK basics
- No build tools

## License

MIT License - See the repository root for details.
