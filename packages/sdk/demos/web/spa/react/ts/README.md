# InsurUp SDK React Demo

A React SPA demonstrating the InsurUp SDK for insurance platform integration.

## Features

- **OAuth2/PKCE Authentication** - Secure authentication using `react-oauth2-code-pkce`
- **Customer Management** - List, view, and create customers with GraphQL pagination
- **Policy Management** - Browse and view policy details
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **React 19** - Uses latest React features like `useActionState` and `useDeferredValue`
- **React Router v7** - Type-safe routing with URL state management
- **Dark Mode** - Toggle between light and dark themes

## Tech Stack

- React 19
- React Router v7
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Sonner (toast notifications)
- Lucide React (icons)

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Copy the environment file and configure your OAuth settings:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
bun run dev
```

4. Open http://localhost:3000 in your browser

## SDK Usage Examples

### Getting Authenticated Client

```tsx
import { useClient } from "@/client";

function MyComponent() {
  const client = useClient();
  
  // Now use client.customers, client.policies, etc.
}
```

### Fetching Customers with GraphQL

```tsx
const result = await client.customers.getCustomers({
  select: ["id", "name", "type", "primaryEmail"] as const,
  first: 10,
  search: { name: { textSearch: { query: "John" } } },
  order: [{ createdAt: "DESC" }],
});
```

### Creating a Customer

```tsx
const result = await client.customers.createCustomer({
  type: CustomerType.Individual,
  fullName: "John Doe",
  identityNumber: "12345678901",
  email: "john@example.com",
  fillMissingFields: true,
});
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── Header.tsx
│   ├── DataTable.tsx
│   ├── Pagination.tsx
│   └── ProtectedRoute.tsx
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── customers/
│   └── policies/
├── config.ts          # OAuth and API configuration
├── client.ts          # SDK client hook
├── App.tsx            # Router and routes
└── main.tsx           # Entry point
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_OAUTH_CLIENT_ID` | OAuth2 client ID |
| `VITE_OAUTH_AUTH_ENDPOINT` | OAuth2 authorization endpoint |
| `VITE_OAUTH_TOKEN_ENDPOINT` | OAuth2 token endpoint |
| `VITE_API_BASE_URL` | InsurUp API base URL |
