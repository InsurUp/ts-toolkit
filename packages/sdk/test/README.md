# Test Utilities Documentation

This directory contains shared test utilities, fixtures, and examples for the InsurUp TypeScript SDK.

## Structure

```
test/
├── fixtures/           # Shared test data
│   ├── auth.fixtures.ts      # Authentication test data
│   ├── case.fixtures.ts      # Case management test data
│   ├── customer.fixtures.ts  # Customer management test data
│   ├── policy.fixtures.ts    # Policy management test data
│   ├── http.fixtures.ts      # HTTP response fixtures
│   └── index.ts             # Centralized exports
├── utils/              # Test utilities and helpers
│   ├── mock-factories.ts     # Factory functions for mocks
│   ├── test-helpers.ts       # Common test operations
│   ├── client-test-base.ts   # Base classes and builders
│   └── index.ts             # Centralized exports
├── examples/           # Example test implementations
│   └── enhanced-case.spec.ts # Comprehensive testing example
└── README.md          # This file
```

## Usage Examples

### Using Fixtures

```typescript
import { caseRequests, caseResults } from './utils';

// Use predefined request data
const request = caseRequests.cancelCase();

// Use predefined result data
const mockResult = caseResults.successfulCaseCreation('CASE-123');
```

### Using Mock Factories

```typescript
import { MockHttpTransportFactory, MockFetchResponseFactory } from './utils';

// Create a mock HTTP transport
const mockHttp = MockHttpTransportFactory.create();

// Create a mock fetch response
const response = MockFetchResponseFactory.json({ success: true });
```

### Using Test Helpers

```typescript
import { TestSetupHelper, TestAssertionHelper } from './utils';

beforeEach(() => {
  TestSetupHelper.cleanup(); // Clears mocks and timers
});

// Assert HTTP calls
TestAssertionHelper.assertHttpCall(mockHttp.post, 'endpoint', requestData);

// Assert results
TestAssertionHelper.assertSuccess(result);
TestAssertionHelper.assertServerError(result, 404);
```

### Using Client Test Builders

```typescript
import { ClientTestSuiteBuilder } from './utils';

describe(
  'methodName',
  ClientTestSuiteBuilder.createDataMethodTests({
    methodName: 'createSomething',
    clientFactory: (http) => new MyClient(http),
    httpMethod: 'post',
    expectedEndpoint: 'endpoint',
    validRequest: requestFixture,
    successResponse: responseFixture,
    errorScenarios: [
      {
        name: 'validation error',
        status: 400,
        type: 'validation-error',
        title: 'Validation Error',
        detail: 'Invalid input'
      }
    ]
  })
);
```

## Benefits

1. **Consistency**: All tests use the same realistic data structures
2. **Maintainability**: Changes to contracts only require fixture updates
3. **Reusability**: Common patterns are abstracted into utilities
4. **Type Safety**: All fixtures are properly typed
5. **Realistic Data**: Fixtures use actual enum values and proper structures
6. **Comprehensive Coverage**: Builders encourage testing both success and error scenarios

## Guidelines

1. **Always use fixtures** instead of inline test data
2. **Use TestSetupHelper.cleanup()** in beforeEach
3. **Use assertion helpers** for consistent error checking
4. **Leverage builders** for comprehensive method testing
5. **Follow the existing patterns** when adding new fixtures
6. **Keep fixtures realistic** - use actual enum values and proper data structures
