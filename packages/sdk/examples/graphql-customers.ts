/**
 * GraphQL Customer Queries Example
 *
 * Demonstrates querying customers using the GraphQL API with full type safety,
 * including field selection, pagination, filtering, searching, and sorting.
 */

import { DefaultInsurUpClient, CustomerType, Gender, SortEnumType } from '@insurup/sdk';
import type {
  GetCustomersOptions,
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
  QueryCustomerModelSortInput,
} from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  tokenProvider: () => 'your-api-token-here',
});

// ============================================================================
// 1. Basic Query - Get all customers with all fields
// ============================================================================

async function getAllCustomers() {
  const result = await client.customers.getCustomers({
    first: 10,
  });

  if (result.isSuccess) {
    console.log(`Total customers: ${result.data.totalCount}`);
    console.log(`Has next page: ${result.data.pageInfo.hasNextPage}`);

    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        // All fields are available since we didn't specify select
        console.log(`${customer.name} (${customer.id}) - ${customer.type}`);
      }
    }
  } else {
    console.error('Failed to fetch customers:', result.message);
  }
}

// ============================================================================
// 2. Type-Safe Field Selection - Only selected fields are available
// ============================================================================

async function getCustomersWithSelectedFields() {
  // When you specify select, only those fields are returned AND TypeScript
  // knows exactly which fields are available
  const result = await client.customers.getCustomers({
    first: 10,
    select: ['id', 'name', 'primaryEmail', 'type', 'gender'],
  });

  if (result.isSuccess) {
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        // ✅ These work - they're in our select list
        console.log(`Name: ${customer.name}`);
        console.log(`Email: ${customer.primaryEmail}`);
        console.log(`Type: ${customer.type}`);
        console.log(`Gender: ${customer.gender}`);

        // ❌ This would cause a TypeScript error:
        // console.log(customer.birthDate); // Property 'birthDate' does not exist
      }
    }
  }
}

// ============================================================================
// 3. Pagination - Cursor-based pagination
// ============================================================================

async function paginateThroughCustomers() {
  let hasNextPage = true;
  let cursor: string | null = null;
  let pageNumber = 1;

  while (hasNextPage) {
    const result = await client.customers.getCustomers({
      first: 20,
      after: cursor,
      select: ['id', 'name'],
    });

    if (!result.isSuccess) {
      console.error('Pagination failed:', result.message);
      break;
    }

    console.log(`\n--- Page ${pageNumber} ---`);
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name} (${customer.id})`);
      }
    }

    hasNextPage = result.data.pageInfo.hasNextPage;
    cursor = result.data.pageInfo.endCursor ?? null;
    pageNumber++;

    // Safety break for demo
    if (pageNumber > 5) {
      console.log('Stopping after 5 pages for demo purposes');
      break;
    }
  }
}

// ============================================================================
// 4. Filtering - Filter customers by various criteria
// ============================================================================

async function filterCustomers() {
  // Filter by customer type
  const filter: QueryCustomerModelFilterInput = {
    type: { eq: CustomerType.Individual },
    gender: { eq: Gender.Female },
  };

  const result = await client.customers.getCustomers({
    first: 10,
    filter,
    select: ['id', 'name', 'type', 'gender'],
  });

  if (result.isSuccess) {
    console.log(`Found ${result.data.totalCount} female individual customers`);
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name}`);
      }
    }
  }
}

// Filter with complex conditions (AND/OR)
async function filterWithComplexConditions() {
  const filter: QueryCustomerModelFilterInput = {
    or: [
      // Customers from Istanbul
      { cityText: { contains: 'Istanbul' } },
      // OR customers from Ankara
      { cityText: { contains: 'Ankara' } },
    ],
    // AND must be Individual type
    type: { eq: CustomerType.Individual },
  };

  const result = await client.customers.getCustomers({
    first: 10,
    filter,
    select: ['id', 'name', 'cityText', 'type'],
  });

  if (result.isSuccess) {
    console.log('Customers from Istanbul or Ankara:');
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name} (${customer.cityText})`);
      }
    }
  }
}

// Filter by date range
async function filterByDateRange() {
  const filter: QueryCustomerModelFilterInput = {
    createdAt: {
      gte: '2024-01-01T00:00:00Z',
      lte: '2024-12-31T23:59:59Z',
    },
  };

  const result = await client.customers.getCustomers({
    first: 10,
    filter,
    select: ['id', 'name', 'createdAt', 'agentBranch.id'],
  });

  if (result.isSuccess) {
    console.log('Customers created in 2024:');
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name} (created: ${customer.createdAt})`);
      }
    }
  }
}

// ============================================================================
// 5. Searching - Full-text search across multiple fields
// ============================================================================

async function searchCustomers() {
  const search: QueryCustomerModelSearchInput = {
    or: [
      { name: { textSearch: { value: 'John' } } },
      { primaryEmail: { textSearch: { value: 'john' } } },
    ],
  };

  const result = await client.customers.getCustomers({
    first: 10,
    search,
    select: ['id', 'name', 'primaryEmail', 'searchScore'],
  });

  if (result.isSuccess) {
    console.log("Search results for 'John':");
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(
          `- ${customer.name} (${customer.primaryEmail}) - score: ${customer.searchScore}`
        );
      }
    }
  }
}

// ============================================================================
// 6. Sorting - Order results by various fields
// ============================================================================

async function sortCustomers() {
  // Sort by creation date (newest first), then by name
  const order: QueryCustomerModelSortInput[] = [
    { createdAt: SortEnumType.DESC },
    { name: SortEnumType.ASC },
  ];

  const result = await client.customers.getCustomers({
    first: 10,
    order,
    select: ['id', 'name', 'createdAt'],
  });

  if (result.isSuccess) {
    console.log('Customers sorted by newest first:');
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name} (${customer.createdAt})`);
      }
    }
  }
}

// Sort by search relevance when searching
async function sortBySearchRelevance() {
  const search: QueryCustomerModelSearchInput = {
    name: { textSearch: { value: 'Smith' } },
  };

  const order: QueryCustomerModelSortInput[] = [
    { searchScore: SortEnumType.DESC }, // Most relevant first
  ];

  const result = await client.customers.getCustomers({
    first: 10,
    search,
    order,
    select: ['id', 'name', 'searchScore'],
  });

  if (result.isSuccess) {
    console.log('Search results sorted by relevance:');
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`- ${customer.name} (score: ${customer.searchScore})`);
      }
    }
  }
}

// ============================================================================
// 7. Combined Example - Search, Filter, Sort, and Select
// ============================================================================

async function combinedQuery() {
  const options: GetCustomersOptions<
    ['id', 'name', 'primaryEmail', 'cityText', 'type', 'createdAt']
  > = {
    // Only select the fields we need
    select: ['id', 'name', 'primaryEmail', 'cityText', 'type', 'createdAt'],

    // Pagination
    first: 20,

    // Filter: Only Individual customers from Istanbul
    filter: {
      type: { eq: CustomerType.Individual },
      cityText: { contains: 'Istanbul' },
    },

    // Sort: Newest first
    order: [{ createdAt: SortEnumType.DESC }],
  };

  const result = await client.customers.getCustomers(options);

  if (result.isSuccess) {
    console.log(`\nFound ${result.data.totalCount} individual customers in Istanbul`);
    console.log('Showing newest 20:');
    console.log('-'.repeat(60));

    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        console.log(`Name:     ${customer.name}`);
        console.log(`Email:    ${customer.primaryEmail ?? 'N/A'}`);
        console.log(`City:     ${customer.cityText ?? 'N/A'}`);
        console.log(`Created:  ${customer.createdAt}`);
        console.log('-'.repeat(60));
      }
    }

    // Pagination info
    const { pageInfo } = result.data;
    console.log(`\nPagination:`);
    console.log(`  Has previous page: ${pageInfo.hasPreviousPage}`);
    console.log(`  Has next page: ${pageInfo.hasNextPage}`);
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      console.log(`  Next page cursor: ${pageInfo.endCursor}`);
    }
  } else {
    console.error('Query failed:', result.message);
  }
}

// ============================================================================
// 8. Using edges instead of nodes
// ============================================================================

async function useEdgesForCursor() {
  const result = await client.customers.getCustomers({
    first: 5,
    select: ['id', 'name'],
  });

  if (result.isSuccess) {
    console.log('Using edges to access cursors for each item:');
    for (const edge of result.data.edges ?? []) {
      if (edge && edge.node) {
        console.log(`- ${edge.node.name} (cursor: ${edge.cursor})`);
      }
    }
  }
}

// ============================================================================
// 9. Filter by consents
// ============================================================================

async function filterByConsents() {
  const filter: QueryCustomerModelFilterInput = {
    consents: {
      some: {
        isActive: { eq: true },
      },
    },
  };

  const result = await client.customers.getCustomers({
    first: 10,
    filter,
    select: ['id', 'name', 'consents.consentType', 'consents.isActive'],
  });

  if (result.isSuccess) {
    console.log('Customers with active consents:');
    for (const customer of result.data.nodes ?? []) {
      if (customer) {
        const activeConsents = customer.consents.filter((c) => c.isActive);
        console.log(`- ${customer.name}: ${activeConsents.length} active consents`);
      }
    }
  }
}

// ============================================================================
// Run the examples
// ============================================================================

async function main() {
  console.log('=== GraphQL Customer Queries Examples ===\n');

  console.log('\n1. Basic Query');
  await getAllCustomers();

  console.log('\n2. Field Selection');
  await getCustomersWithSelectedFields();

  console.log('\n3. Pagination');
  await paginateThroughCustomers();

  console.log('\n4. Filtering');
  await filterCustomers();
  await filterWithComplexConditions();
  await filterByDateRange();

  console.log('\n5. Searching');
  await searchCustomers();

  console.log('\n6. Sorting');
  await sortCustomers();
  await sortBySearchRelevance();

  console.log('\n7. Combined Query');
  await combinedQuery();

  console.log('\n8. Using Edges');
  await useEdgesForCursor();

  console.log('\n9. Filter by Consents');
  await filterByConsents();
}

main().catch(console.error);
