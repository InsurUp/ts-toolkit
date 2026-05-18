# InsurUp Contracts

[![npm version](https://img.shields.io/npm/v/@insurup/contracts.svg)](https://www.npmjs.com/package/@insurup/contracts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Runtime](https://img.shields.io/badge/runtime-0%20bytes-brightgreen.svg)](package.json)

Type-safe TypeScript contracts and type definitions for the InsurUp insurance platform. Use standalone for custom implementations or alongside `@insurup/sdk`.

---

## Installation

```bash
npm install @insurup/contracts
```

```bash
pnpm add @insurup/contracts
```

```bash
bun add @insurup/contracts
```

---

## Usage

### Import Types

```typescript
import type {
  Customer,
  CustomerType,
  Policy,
  PolicyState,
  ProductBranch,
  Vehicle,
  Property,
  Case,
  CaseState,
} from '@insurup/contracts';
```

### Use with Your Own API Client

```typescript
import type { Customer, CreateCustomerRequest, CustomerResponse } from '@insurup/contracts';

async function createCustomer(data: CreateCustomerRequest): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: CustomerResponse = await response.json();
  return result.data;
}
```

### Type Guards and Validation

```typescript
import { CustomerType, PolicyState } from '@insurup/contracts';

function isIndividualCustomer(type: CustomerType): boolean {
  return type === CustomerType.Individual;
}

function isPolicyActive(state: PolicyState): boolean {
  return state === PolicyState.Active;
}
```

### GraphQL Query Types

```typescript
import type {
  CustomerFilterInput,
  CustomerSortInput,
  SortEnumType,
  GraphQLPageInfo,
} from '@insurup/contracts';

const filter: CustomerFilterInput = {
  customerType: { eq: CustomerType.Individual },
  createdAt: { gte: '2024-01-01' },
};

const sort: CustomerSortInput = {
  createdAt: SortEnumType.Desc,
};
```

---

## Available Types

### Core Domains

| Module         | Description                          | Key Types                                                                    |
| -------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| **Customers**  | Customer profiles and contact info   | `Customer`, `CustomerType`, `CreateCustomerRequest`, `UpdateCustomerRequest` |
| **Policies**   | Insurance policies and documents     | `Policy`, `PolicyState`, `PolicyDocument`, `PolicyRepresentative`            |
| **Proposals**  | Insurance quotes and comparisons     | `Proposal`, `ProposalComparison`, `CreateProposalRequest`                    |
| **Vehicles**   | Vehicle data and lookups             | `Vehicle`, `VehicleBrand`, `VehicleModel`, `UsageType`                       |
| **Properties** | Property and DASK insurance          | `Property`, `PropertyType`, `DaskPolicy`                                     |
| **Cases**      | Claims, complaints, service requests | `Case`, `CaseState`, `CaseType`, `CasePriority`                              |
| **Coverage**   | Coverage configuration               | `Coverage`, `CoverageGroup`, `CoverageDefinition`                            |

### Agent & Organization

| Module             | Description                    | Key Types                                         |
| ------------------ | ------------------------------ | ------------------------------------------------- |
| **Agents**         | Insurance agents and companies | `Agent`, `AgentProfile`, `AgentCompanyConnection` |
| **Agent Branches** | Branch management              | `AgentBranch`, `CreateBranchRequest`              |
| **Agent Users**    | Staff and access control       | `AgentUser`, `AgentRole`, `Permission`            |

### Platform

| Module        | Description            | Key Types                                             |
| ------------- | ---------------------- | ----------------------------------------------------- |
| **Insurance** | Companies and products | `InsuranceCompany`, `InsuranceProduct`, `ResourceKey` |
| **Webhooks**  | Event notifications    | `Webhook`, `WebhookEvent`, `WebhookDelivery`          |
| **Files**     | Document management    | `FileUpload`, `FileMetadata`                          |
| **Templates** | Document templates     | `Template`, `TemplateType`                            |
| **Languages** | Localization           | `Language`, `TranslationKey`                          |

### Common Types

| Type            | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `DateTime`      | ISO 8601 date-time string                                   |
| `DateOnly`      | ISO 8601 date string (YYYY-MM-DD)                           |
| `Money`         | Monetary value with currency                                |
| `Address`       | Structured address                                          |
| `PhoneNumber`   | Phone with country code                                     |
| `ProductBranch` | Insurance product categories (Traffic, Casco, Health, etc.) |

### GraphQL Types

For building GraphQL queries with filtering, sorting, and pagination:

```typescript
import type {
  // Pagination
  GraphQLPageInfo,
  GraphQLConnection,

  // Filtering
  CustomerFilterInput,
  PolicyFilterInput,
  CaseFilterInput,
  StringOperationFilterInput,
  IntOperationFilterInput,
  DateTimeOperationFilterInput,

  // Sorting
  CustomerSortInput,
  PolicySortInput,
  SortEnumType,

  // Search
  CustomerSearchInput,
  SearchTextInput,
} from '@insurup/contracts';
```

---

## Runtime Field Metadata

Every `Query*Model` / `Query*Result` interface has an auto-generated runtime metadata object that describes its fields -- their types, nullability, and enum values. Useful for building dynamic UIs, filters, column configuration, and validation without hard-coding field info.

### Using `getModelMeta`

Look up any model's metadata by name with full autocomplete and type safety:

```typescript
import { getModelMeta } from '@insurup/contracts';

const meta = getModelMeta('QueryCustomerModel');

meta.id.type; // "string"
meta.createdAt.type; // "DateTime"
meta.gender.type; // "enum"
meta.gender.values; // readonly ["UNKNOWN", "MALE", "FEMALE", "OTHER"]
meta.gender.nullable; // true
```

### Importing Individual Meta Objects

```typescript
import { QueryCustomerModelMeta, QueryPoliciesResultMeta } from '@insurup/contracts';

// Check if a field is an enum
if (QueryCustomerModelMeta.type.type === 'enum') {
  console.log(QueryCustomerModelMeta.type.values);
  // ["INDIVIDUAL", "COMPANY", "FOREIGN"]
}
```

### Available Meta Objects

| Meta Object                          | Source Interface                 |
| ------------------------------------ | -------------------------------- |
| `QueryCustomerModelMeta`             | `QueryCustomerModel`             |
| `QueryCustomerConsentModelMeta`      | `QueryCustomerConsentModel`      |
| `QueryCaseModelMeta`                 | `QueryCaseModel`                 |
| `QueryPoliciesResultMeta`            | `QueryPoliciesResult`            |
| `QueryProposalsResultMeta`           | `QueryProposalsResult`           |
| `QueryAgentUserResultMeta`           | `QueryAgentUserResult`           |
| `QueryWebhookDeliveryResultMeta`     | `QueryWebhookDeliveryResult`     |
| `QueryPolicyTransfersResultMeta`     | `QueryPolicyTransfersResult`     |
| `QueryFilePolicyTransfersResultMeta` | `QueryFilePolicyTransfersResult` |

### Field Types

Each field in a meta object has a `type` discriminant:

| `type`       | Description            | Extra Properties      |
| ------------ | ---------------------- | --------------------- |
| `"string"`   | String field           | `nullable?`           |
| `"number"`   | Number field           | `nullable?`           |
| `"boolean"`  | Boolean field          | `nullable?`           |
| `"DateTime"` | ISO 8601 date-time     | `nullable?`           |
| `"DateOnly"` | Date-only (YYYY-MM-DD) | `nullable?`           |
| `"enum"`     | Enum field             | `values`, `nullable?` |

> **Note:** Meta objects are auto-generated from interfaces marked with `@meta` JSDoc tags. Object and array properties are excluded -- only primitive, date, and enum fields are included.

---

## Enums

All enums are exported as both types and runtime values:

```typescript
import {
  CustomerType, // Enum value
  PolicyState, // Enum value
  ProductBranch, // Enum value
  CaseState, // Enum value
  CasePriority, // Enum value
} from '@insurup/contracts';

// Use as values
const type = CustomerType.Individual;
const state = PolicyState.Active;
const branch = ProductBranch.Traffic;

// Use as types
function handlePolicy(state: PolicyState): void {
  switch (state) {
    case PolicyState.Active:
      // ...
      break;
    case PolicyState.Cancelled:
      // ...
      break;
  }
}
```

### Key Enums

| Enum            | Values                                                           |
| --------------- | ---------------------------------------------------------------- |
| `CustomerType`  | `Individual`, `Corporate`                                        |
| `PolicyState`   | `Active`, `Cancelled`, `Expired`, `Pending`                      |
| `ProductBranch` | `Traffic`, `Casco`, `Health`, `Dask`, `Travel`, `Liability`, ... |
| `CaseState`     | `Open`, `InProgress`, `Resolved`, `Closed`                       |
| `CasePriority`  | `Low`, `Medium`, `High`, `Critical`                              |
| `CaseType`      | `Claim`, `Complaint`, `ServiceRequest`, `Inquiry`                |
| `SortEnumType`  | `Asc`, `Desc`                                                    |

---

## When to Use This Package

| Scenario                                 | Recommendation                          |
| ---------------------------------------- | --------------------------------------- |
| Building a full application with InsurUp | Use `@insurup/sdk` (includes all types) |
| Custom HTTP client implementation        | Use `@insurup/contracts`                |
| Shared library with InsurUp types        | Use `@insurup/contracts`                |
| Backend validation schemas               | Use `@insurup/contracts`                |
| Type-only imports (no runtime)           | Use `@insurup/contracts`                |

---

## Compatibility

| Environment | Support |
| ----------- | ------- |
| Node.js     | 18+     |
| Browsers    | ES2022+ |
| Bun         | 1.0+    |
| Deno        | 1.0+    |

Dual ESM/CJS builds included. Full tree-shaking support.

---

## Related Packages

- [`@insurup/sdk`](https://www.npmjs.com/package/@insurup/sdk) — Full-featured SDK with HTTP client, GraphQL support, and error handling

---

## License

[MIT](LICENSE)
