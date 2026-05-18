/**
 * Basic Usage Example
 *
 * Demonstrates client initialization and simple operations with the InsurUp SDK.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';

// Print SDK info
console.log('InsurUp SDK - Basic Usage Example');

// ============================================================================
// 1. Basic client initialization (no authentication)
// ============================================================================

const client = new DefaultInsurUpClient();

// ============================================================================
// 2. Client with static token authentication
// ============================================================================

const authenticatedClient = new DefaultInsurUpClient({
  tokenProvider: () => 'your-api-token-here',
});

// ============================================================================
// 3. Client with async token provider (e.g., from auth service)
// ============================================================================

const dynamicAuthClient = new DefaultInsurUpClient({
  tokenProvider: async () => {
    // Fetch token from your auth service
    // const response = await fetch('/api/auth/token');
    // const { token } = await response.json();
    // return token;
    return 'dynamic-token';
  },
});

// ============================================================================
// 4. Client with custom configuration
// ============================================================================

const customClient = new DefaultInsurUpClient({
  baseUrl: 'https://api.staging.insurup.com/api/',
  timeoutMs: 60000, // 60 second timeout
  tokenProvider: () => 'your-api-token-here',
  customHeaders: {
    'X-Request-Source': 'my-application',
  },
});

// ============================================================================
// 5. Using the client to make API calls
// ============================================================================

async function basicUsage() {
  // Get available languages
  const languagesResult = await client.languages.getLanguages();

  if (languagesResult.isSuccess) {
    console.log('Available languages:', languagesResult.data);
  } else {
    console.error('Failed to fetch languages:', languagesResult.message);
  }

  // Get insurance companies
  const companiesResult = await client.insurance.getInsuranceCompanies();

  if (companiesResult.isSuccess) {
    console.log(`Found ${companiesResult.data.length} insurance companies`);
  }
}

// Suppress unused variable warnings for demonstration clients
void authenticatedClient;
void dynamicAuthClient;
void customClient;

basicUsage();
