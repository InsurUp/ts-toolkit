/**
 * Error Handling Example
 *
 * Demonstrates Result type handling and error recovery patterns with the InsurUp SDK.
 */

import {
  DefaultInsurUpClient,
  InsurUpError,
  InsurUpServerErrorType,
  InsurUpClientErrorType,
  getDataOrThrow,
  throwIfError,
} from '@insurup/sdk';
import type { GetCustomerResult, InsurUpResult, ValidationError } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  tokenProvider: () => 'your-api-token-here',
});

// ============================================================================
// 1. Basic Result type handling
// ============================================================================

async function basicResultHandling() {
  const result = await client.customers.getCustomer('customer-123');

  // Check success/failure using isSuccess
  if (result.isSuccess) {
    // TypeScript knows result.data is available here
    console.log('Customer ID:', result.data.id);
  } else {
    // TypeScript knows we're in an error state here
    console.error('Error:', result.message);
  }
}

// ============================================================================
// 2. Handling different error types
// ============================================================================

async function handleDifferentErrors() {
  const result = await client.customers.getCustomer('customer-123');

  if (!result.isSuccess) {
    // Check if it's a server error or client error based on kind
    if (result.kind === 'server-error') {
      switch (result.type) {
        // Server errors
        case InsurUpServerErrorType.ResourceNotFound:
          console.error('Customer not found');
          break;
        case InsurUpServerErrorType.Unauthorized:
          console.error('Please log in to continue');
          break;
        case InsurUpServerErrorType.AccessDenied:
          console.error('You do not have permission to view this customer');
          break;
        case InsurUpServerErrorType.InputValidation:
          console.error('Invalid request:', result.message);
          // Validation errors include field-level details
          handleValidationErrors(result.validationErrors);
          break;
        case InsurUpServerErrorType.BusinessValidation:
          console.error('Business rule violation:', result.message);
          break;
        case InsurUpServerErrorType.ResourceDuplicate:
          console.error('Resource conflict - customer may already exist');
          break;
        case InsurUpServerErrorType.Upstream:
          console.error('Upstream service error - please try again later');
          break;
        default:
          console.error('Server error:', result.message);
      }
    } else if (result.kind === 'client-error') {
      switch (result.type) {
        // Client-side errors
        case InsurUpClientErrorType.HttpRequestFailed:
          console.error('Network error - check your connection');
          break;
        case InsurUpClientErrorType.Timeout:
          console.error('Request timed out');
          break;
        case InsurUpClientErrorType.JsonDeserialization:
          console.error('Failed to parse response');
          break;
        case InsurUpClientErrorType.NullResponse:
          console.error('Empty response received');
          break;
        default:
          console.error('Client error:', result.message);
      }
    }
  }
}

// ============================================================================
// 3. Handling validation errors with field details
// ============================================================================

function handleValidationErrors(errors: readonly ValidationError[]) {
  if (errors.length === 0) return;

  console.error('Validation failed:');
  for (const error of errors) {
    console.error(`  ${error.propertyName}: ${error.errorMessage}`);
  }

  // Example output:
  // Validation failed:
  //   email: Invalid email format
  //   phoneNumber: Phone number is required
}

async function createCustomerWithValidation() {
  const result = await client.customers.createCustomer({
    type: 'INDIVIDUAL' as never, // Invalid type for demonstration
    identityNumber: 'invalid', // Too short
    fullName: '', // Required
    birthDate: 'not-a-date', // Invalid format
    fillMissingFields: false,
  } as never);

  if (!result.isSuccess && result.kind === 'server-error') {
    if (result.type === InsurUpServerErrorType.InputValidation) {
      handleValidationErrors(result.validationErrors);
    }
  }
}

// ============================================================================
// 4. Using getDataOrThrow for exceptions
// ============================================================================

async function useGetDataOrThrow() {
  try {
    // Throws InsurUpError if the request fails
    const customer = getDataOrThrow<GetCustomerResult>(
      await client.customers.getCustomer('customer-123')
    );

    console.log('Customer ID:', customer.id);
  } catch (error) {
    if (error instanceof InsurUpError) {
      console.error('API Error:', error.message);
      console.error('Error Kind:', error.error.kind);
      if (error.error.kind === 'server-error') {
        console.error('Status Code:', error.error.status);
      }
    } else {
      throw error; // Re-throw unexpected errors
    }
  }
}

// ============================================================================
// 5. Using throwIfError for void operations
// ============================================================================

async function useThrowIfError() {
  try {
    // For operations that don't return data (PUT, DELETE)
    throwIfError(await client.customers.deleteCustomer('customer-123'));
    console.log('Customer deleted successfully');
  } catch (error) {
    if (error instanceof InsurUpError) {
      if (
        error.error.kind === 'server-error' &&
        error.error.type === InsurUpServerErrorType.ResourceNotFound
      ) {
        console.log('Customer was already deleted');
      } else {
        console.error('Failed to delete:', error.message);
      }
    }
  }
}

// ============================================================================
// 6. Request cancellation with AbortController
// ============================================================================

async function cancelableRequest() {
  const controller = new AbortController();

  // Cancel after 5 seconds
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const result = await client.customers.getCustomer('customer-123', {
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (
    !result.isSuccess &&
    result.kind === 'client-error' &&
    result.type === InsurUpClientErrorType.Timeout
  ) {
    console.log('Request was cancelled or timed out');
  }
}

// React example: Cancel on unmount
function useCustomer(_customerId: string) {
  // In a React component:
  // useEffect(() => {
  //   const controller = new AbortController();
  //
  //   client.customers.getCustomer(customerId, { signal: controller.signal })
  //     .then(result => {
  //       if (result.isSuccess) setCustomer(result.data);
  //     });
  //
  //   return () => controller.abort(); // Cancel on unmount
  // }, [customerId]);
}

// ============================================================================
// 7. Custom timeout per request
// ============================================================================

async function requestWithCustomTimeout() {
  // Override default timeout for a slow operation
  const result = await client.customers.getCustomer('customer-123', {
    timeoutMs: 60000, // 60 seconds
  });

  if (
    !result.isSuccess &&
    result.kind === 'client-error' &&
    result.type === InsurUpClientErrorType.Timeout
  ) {
    console.error('Request timed out after 60 seconds');
  }
}

// ============================================================================
// 8. Retry pattern for transient errors
// ============================================================================

async function retryOnTransientError<T>(
  operation: () => Promise<InsurUpResult<T>>,
  maxRetries = 3,
  delayMs = 1000
): Promise<InsurUpResult<T>> {
  let lastResult: InsurUpResult<T>;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    lastResult = await operation();

    if (lastResult.isSuccess) {
      return lastResult;
    }

    // Only retry on transient errors
    const isTransient =
      (lastResult.kind === 'server-error' && lastResult.type === InsurUpServerErrorType.Upstream) ||
      (lastResult.kind === 'client-error' &&
        (lastResult.type === InsurUpClientErrorType.HttpRequestFailed ||
          lastResult.type === InsurUpClientErrorType.Timeout));

    if (!isTransient) {
      return lastResult; // Don't retry non-transient errors
    }

    if (attempt < maxRetries - 1) {
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2; // Exponential backoff
    }
  }

  return lastResult!;
}

async function useRetryPattern() {
  const result = await retryOnTransientError<GetCustomerResult>(() =>
    client.customers.getCustomer('customer-123')
  );

  if (result.isSuccess) {
    console.log('Success after retries:', result.data);
  } else {
    console.error('Failed after all retries:', result.message);
  }
}

// ============================================================================
// 9. Generic error handler utility
// ============================================================================

function handleApiError(result: InsurUpResult<unknown>): never {
  if (result.isSuccess) {
    throw new Error('handleApiError called with successful result');
  }

  // Log for debugging
  console.error('API Error:', {
    kind: result.kind,
    message: result.message,
    ...(result.kind === 'server-error' && { status: result.status }),
  });

  // Throw InsurUpError for your application
  throw new InsurUpError(result);
}

async function useGenericHandler() {
  const result = await client.customers.getCustomer('customer-123');

  if (!result.isSuccess) {
    handleApiError(result);
  }

  // TypeScript knows result.data is available here
  return result.data;
}

// ============================================================================
// Run examples
// ============================================================================

async function main() {
  await basicResultHandling();
  await handleDifferentErrors();
  await useGetDataOrThrow();
  await useThrowIfError();
}

// Suppress unused variable warnings for demonstration functions
void createCustomerWithValidation;
void cancelableRequest;
void useCustomer;
void requestWithCustomTimeout;
void useRetryPattern;
void useGenericHandler;

main().catch(console.error);
