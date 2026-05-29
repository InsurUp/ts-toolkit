/**
 * @fileoverview Customer Flow Integration Tests
 * @description End-to-end tests for complete customer workflows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { CustomerType, Gender } from '@insurup/contracts';
import type {
  CreateCustomerRequestIndividual,
  GetCustomerResultIndividual,
  UpdateCustomerRequestIndividual,
} from '@insurup/contracts';
import { MockFetchResponseFactory, customerRequests, customerResponses } from '../utils';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Customer Flow Integration Tests', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 50,
        factor: 1.5,
        randomize: false,
      },
    });
  });

  describe('Create and Retrieve Flow', () => {
    it('should create a customer and then retrieve it', async () => {
      const createRequest = customerRequests.validIndividualCustomer();
      const customerId = 'CUSTOMER-NEW-123';

      // Step 1: Create customer - mock the response
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: customerId }, 201));

      const createResult = await client.customers.createCustomer(createRequest);

      expect(createResult.kind).toBe('success');
      if (createResult.kind === 'success') {
        expect(createResult.data.id).toBe(customerId);
      }

      // Verify create request was made correctly
      // SDK transforms type -> $type with lowercase discriminator for API
      const { type: _type, ...restRequest } = createRequest;
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.api.com/api/customers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ $type: 'individual', ...restRequest }),
        })
      );

      // Step 2: Retrieve the created customer
      const baseCustomer = customerResponses.individualCustomer();
      const customerData: GetCustomerResultIndividual = {
        ...baseCustomer,
        id: customerId,
      };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(customerData));

      const getResult = await client.customers.getCustomer(customerId);

      expect(getResult.kind).toBe('success');
      if (getResult.kind === 'success') {
        expect(getResult.data.id).toBe(customerId);
        expect(getResult.data.type).toBe(CustomerType.Individual);
        if (getResult.data.type === CustomerType.Individual) {
          expect(getResult.data.fullName).toBe(createRequest.fullName);
        }
      }

      // Verify get request was made correctly
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test.api.com/api/customers/${customerId}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle customer not found after creation attempt fails', async () => {
      const createRequest = customerRequests.validIndividualCustomer();

      // Step 1: Create fails with validation error
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/input-validation',
          'Bad Request',
          'Identity number already exists'
        )
      );

      const createResult = await client.customers.createCustomer(createRequest);

      expect(createResult.kind).toBe('server-error');
      if (createResult.kind === 'server-error') {
        expect(createResult.status).toBe(400);
      }

      // Step 2: Try to retrieve with a guessed ID - should fail
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          404,
          'https://api.insurup.com/problems/resource-not-found',
          'Not Found',
          'Customer not found'
        )
      );

      const getResult = await client.customers.getCustomer('CUSTOMER-GUESS-123');

      expect(getResult.kind).toBe('server-error');
      if (getResult.kind === 'server-error') {
        expect(getResult.status).toBe(404);
      }
    });
  });

  describe('Update Workflow', () => {
    it('should create, update, and verify customer changes', async () => {
      const customerId = 'CUSTOMER-UPDATE-123';
      const initialRequest = customerRequests.validIndividualCustomer();

      // Step 1: Create customer
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: customerId }, 201));

      await client.customers.createCustomer(initialRequest);

      // Step 2: Update customer
      const updateRequest: UpdateCustomerRequestIndividual = {
        type: CustomerType.Individual,
        id: customerId,
        fullName: 'John Updated Doe',
        primaryEmail: 'john.updated@example.com',
        fillMissingFields: false,
      };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const updateResult = await client.customers.updateCustomer(updateRequest);

      expect(updateResult.kind).toBe('success');
      expect(updateResult.isSuccess).toBe(true);

      // Step 3: Retrieve and verify updates
      const baseForUpdate = customerResponses.individualCustomer();
      const updatedCustomerData: GetCustomerResultIndividual = {
        ...baseForUpdate,
        id: customerId,
        fullName: 'John Updated Doe',
        primaryEmail: 'john.updated@example.com',
      };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(updatedCustomerData));

      const getResult = await client.customers.getCustomer(customerId);

      expect(getResult.kind).toBe('success');
      if (getResult.kind === 'success' && getResult.data.type === CustomerType.Individual) {
        expect(getResult.data.fullName).toBe('John Updated Doe');
        expect(getResult.data.primaryEmail).toBe('john.updated@example.com');
      }
    });

    it('should handle update failure and maintain original state', async () => {
      const customerId = 'CUSTOMER-123';

      // Step 1: Get original customer
      const originalCustomer = customerResponses.individualCustomer();
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(originalCustomer));

      const originalResult = await client.customers.getCustomer(customerId);
      expect(originalResult.kind).toBe('success');

      // Step 2: Attempt update that fails
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/input-validation',
          'Bad Request',
          'Invalid email format'
        )
      );

      const updateResult = await client.customers.updateCustomer({
        type: CustomerType.Individual,
        id: customerId,
        primaryEmail: 'invalid-email',
        fillMissingFields: false,
      } as UpdateCustomerRequestIndividual);

      expect(updateResult.kind).toBe('server-error');

      // Step 3: Verify original state is maintained
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(originalCustomer));

      const verifyResult = await client.customers.getCustomer(customerId);

      expect(verifyResult.kind).toBe('success');
      if (verifyResult.kind === 'success') {
        expect(verifyResult.data.primaryEmail).toBe(originalCustomer.primaryEmail);
      }
    });
  });

  describe('Customer Contact Information Flow', () => {
    it('should manage customer email addresses', async () => {
      const customerId = 'CUSTOMER-123';

      // Step 1: Get current emails
      const existingEmails = [
        { email: 'primary@example.com', isPrimary: true },
        { email: 'secondary@example.com', isPrimary: false },
      ];

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(existingEmails));

      const emailsResult = await client.customers.getCustomerEmails(customerId);

      expect(emailsResult.kind).toBe('success');
      if (emailsResult.kind === 'success') {
        expect(emailsResult.data).toHaveLength(2);
      }

      // Step 2: Add new email
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const addResult = await client.customers.addCustomerEmail({
        customerId,
        email: 'new@example.com',
      });

      expect(addResult.kind).toBe('success');

      // Step 3: Verify new email was added
      const updatedEmails = [...existingEmails, { email: 'new@example.com', isPrimary: false }];

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(updatedEmails));

      const verifyResult = await client.customers.getCustomerEmails(customerId);

      expect(verifyResult.kind).toBe('success');
      if (verifyResult.kind === 'success') {
        expect(verifyResult.data).toHaveLength(3);
      }
    });

    it('should manage customer phone numbers', async () => {
      const customerId = 'CUSTOMER-123';

      // Step 1: Get current phone numbers
      const existingPhones = [{ number: '5551234567', countryCode: 90, isPrimary: true }];

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(existingPhones));

      const phonesResult = await client.customers.getCustomerPhoneNumbers(customerId);

      expect(phonesResult.kind).toBe('success');
      if (phonesResult.kind === 'success') {
        expect(phonesResult.data).toHaveLength(1);
      }

      // Step 2: Add secondary phone
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const addResult = await client.customers.addCustomerPhoneNumber({
        customerId,
        phoneNumber: {
          number: '5559876543',
          countryCode: 90,
        },
      });

      expect(addResult.kind).toBe('success');
    });
  });

  describe('Customer with Address Management', () => {
    it('should create customer and manage addresses', async () => {
      const customerId = 'CUSTOMER-ADDR-123';

      // Step 1: Create customer
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: customerId }, 201));

      await client.customers.createCustomer(customerRequests.validIndividualCustomer());

      // Step 2: Create address for customer
      const createResponse = { addressId: 'ADDRESS-123' };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(createResponse, 201));

      const addressResult = await client.customers.createCustomerAddress({
        customerId,
        propertyNumber: 12345,
        type: 'HOME',
      });

      expect(addressResult.kind).toBe('success');
      if (addressResult.kind === 'success') {
        expect(addressResult.data.addressId).toBe('ADDRESS-123');
      }

      // Step 3: Retrieve all addresses
      const getResponse = {
        id: 'ADDRESS-123',
        propertyNumber: 12345,
        type: 'HOME',
        address: {},
        createdAt: '2026-01-01T00:00:00Z',
      };
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json([getResponse]));

      const addressesResult = await client.customers.getCustomerAddresses(customerId);

      expect(addressesResult.kind).toBe('success');
      if (addressesResult.kind === 'success') {
        expect(addressesResult.data).toHaveLength(1);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple customer creations in parallel', async () => {
      const customers: CreateCustomerRequestIndividual[] = [
        {
          ...customerRequests.validIndividualCustomer(),
          identityNumber: '11111111111',
          fullName: 'Customer One',
        },
        {
          ...customerRequests.validIndividualCustomer(),
          identityNumber: '22222222222',
          fullName: 'Customer Two',
        },
        {
          ...customerRequests.validIndividualCustomer(),
          identityNumber: '33333333333',
          fullName: 'Customer Three',
        },
      ];

      // Mock responses for each creation
      customers.forEach((_, index) => {
        mockFetch.mockResolvedValueOnce(
          MockFetchResponseFactory.json({ id: `CUSTOMER-${index + 1}` }, 201)
        );
      });

      // Execute all creations in parallel
      const results = await Promise.all(
        customers.map((customer) => client.customers.createCustomer(customer))
      );

      // Verify all succeeded
      results.forEach((result, index) => {
        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(result.data.id).toBe(`CUSTOMER-${index + 1}`);
        }
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success/failure in parallel operations', async () => {
      // Mock: first succeeds, second fails, third succeeds
      mockFetch
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-1' }, 201))
        .mockResolvedValueOnce(
          MockFetchResponseFactory.error(
            409,
            'https://api.insurup.com/problems/resource-duplicate',
            'Conflict',
            'Customer already exists'
          )
        )
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-3' }, 201));

      const customers = [
        { ...customerRequests.validIndividualCustomer(), identityNumber: '11111111111' },
        { ...customerRequests.validIndividualCustomer(), identityNumber: '22222222222' },
        { ...customerRequests.validIndividualCustomer(), identityNumber: '33333333333' },
      ];

      const results = await Promise.all(
        customers.map((customer) => client.customers.createCustomer(customer))
      );

      const [first, second, third] = results;
      expect(first?.kind).toBe('success');
      expect(second?.kind).toBe('server-error');
      expect(third?.kind).toBe('success');

      if (second?.kind === 'server-error') {
        expect(second.status).toBe(409);
      }
    });

    it('should handle parallel get and update operations', async () => {
      const customerId = 'CUSTOMER-123';
      const customerData = customerResponses.individualCustomer();

      // Mock: get succeeds, update succeeds
      mockFetch
        .mockResolvedValueOnce(MockFetchResponseFactory.json(customerData))
        .mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const [getResult, updateResult] = await Promise.all([
        client.customers.getCustomer(customerId),
        client.customers.updateCustomer({
          type: CustomerType.Individual,
          id: customerId,
          fullName: 'Updated Name',
          fillMissingFields: false,
        } as UpdateCustomerRequestIndividual),
      ]);

      expect(getResult.kind).toBe('success');
      expect(updateResult.kind).toBe('success');
    });
  });

  describe('Customer Lifecycle Flow', () => {
    it('should complete full customer lifecycle: create, use, delete', async () => {
      const customerId = 'CUSTOMER-LIFECYCLE-123';

      // Step 1: Create customer
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: customerId }, 201));

      const createResult = await client.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );

      expect(createResult.kind).toBe('success');

      // Step 2: Use customer - get details
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json({
          ...customerResponses.individualCustomer(),
          id: customerId,
        })
      );

      const getResult = await client.customers.getCustomer(customerId);
      expect(getResult.kind).toBe('success');

      // Step 3: Delete customer
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const deleteResult = await client.customers.deleteCustomer(customerId);
      expect(deleteResult.kind).toBe('success');

      // Step 4: Verify customer is gone
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          404,
          'https://api.insurup.com/problems/resource-not-found',
          'Not Found',
          'Customer not found'
        )
      );

      const verifyResult = await client.customers.getCustomer(customerId);
      expect(verifyResult.kind).toBe('server-error');
      if (verifyResult.kind === 'server-error') {
        expect(verifyResult.status).toBe(404);
      }
    });
  });

  describe('Customer Representative Assignment', () => {
    it('should assign and verify customer representative', async () => {
      const customerId = 'CUSTOMER-123';
      const agentId = 'AGENT-456';

      // Step 1: Assign representative
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const assignResult = await client.customers.setCustomerRepresentative({
        customerId,
        representativeAgentUserId: agentId,
      });

      expect(assignResult.kind).toBe('success');

      // Step 2: Verify assignment by getting customer
      const baseForRep = customerResponses.individualCustomer();
      const customerWithRep: GetCustomerResultIndividual = {
        ...baseForRep,
        id: customerId,
        representedBy: {
          id: agentId,
          name: 'Agent Smith',
        },
      };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(customerWithRep));

      const getResult = await client.customers.getCustomer(customerId);

      expect(getResult.kind).toBe('success');
      if (getResult.kind === 'success') {
        expect(getResult.data.representedBy?.id).toBe(agentId);
      }
    });
  });

  describe('External Customer Lookup Flow', () => {
    it('should lookup and create customer from external data', async () => {
      // Step 1: Perform external lookup for individual customer
      const lookupResponse = { $type: 'individual' };

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(lookupResponse));

      const lookup = await client.customers.externalLookupCustomer({
        $type: 'individual',
        identityNumber: 12345678901,
        birthDate: '1990-05-15',
      });

      expect(lookup.kind).toBe('success');

      // Step 2: Create customer with lookup data
      if (lookup.kind === 'success') {
        mockFetch.mockResolvedValueOnce(
          MockFetchResponseFactory.json({ id: 'CUSTOMER-EXTERNAL-123' }, 201)
        );

        const createResult = await client.customers.createCustomer({
          type: CustomerType.Individual,
          identityNumber: '12345678901',
          fullName: 'John Doe',
          birthDate: '1990-05-15',
          fillMissingFields: false,
        });

        expect(createResult.kind).toBe('success');
      }
    });

    it('should narrow to individual result via the $type discriminator', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json({
          $type: 'individual',
          fullName: 'John Doe',
          gender: Gender.Male,
          email: 'john@example.com',
        })
      );

      const lookup = await client.customers.externalLookupCustomer({
        $type: 'individual',
        identityNumber: 12345678901,
        birthDate: '1990-05-15',
      });

      expect(lookup.kind).toBe('success');
      if (lookup.kind === 'success' && lookup.data.$type === 'individual') {
        expect(lookup.data.fullName).toBe('John Doe');
        expect(lookup.data.gender).toBe(Gender.Male);
        expect(lookup.data.email).toBe('john@example.com');
      }
    });

    it('should narrow to company result via the $type discriminator', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json({ $type: 'company', title: 'Acme Inc.' })
      );

      const lookup = await client.customers.externalLookupCustomer({
        $type: 'company',
        taxNumber: '1234567890',
      });

      expect(lookup.kind).toBe('success');
      if (lookup.kind === 'success' && lookup.data.$type === 'company') {
        expect(lookup.data.title).toBe('Acme Inc.');
      }
    });

    it('should narrow to foreign result via the $type discriminator', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json({
          $type: 'foreign',
          fullName: 'Jane Roe',
          gender: Gender.Female,
        })
      );

      const lookup = await client.customers.externalLookupCustomer({
        $type: 'foreign',
        identityNumber: 'P1234567',
        birthDate: '1985-03-20',
      });

      expect(lookup.kind).toBe('success');
      if (lookup.kind === 'success' && lookup.data.$type === 'foreign') {
        expect(lookup.data.fullName).toBe('Jane Roe');
        expect(lookup.data.gender).toBe(Gender.Female);
      }
    });

    it('should serialize $type as the first body property regardless of caller key order', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ $type: 'individual' }));

      // Caller puts $type last; the backend's System.Text.Json binder requires it first, so the
      // SDK must reorder it to the front of the JSON body.
      await client.customers.externalLookupCustomer({
        identityNumber: 12345678901,
        birthDate: '1990-05-15',
        $type: 'individual',
      });

      const [, init] = mockFetch.mock.calls[0] ?? [];
      const body = init?.body as string;
      expect(body.startsWith('{"$type":"individual"')).toBe(true);
      expect(Object.keys(JSON.parse(body))[0]).toBe('$type');
    });
  });

  describe('Customer Branch Assignment Flow', () => {
    it('should assign customer to branch', async () => {
      const customerId = 'CUSTOMER-123';
      const agentBranchId = 'BRANCH-456';

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const result = await client.customers.setCustomerBranch({
        customerId,
        agentBranchId,
      });

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test.api.com/api/customers/${customerId}/branch`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ customerId, agentBranchId }),
        })
      );
    });

    it('should unassign a customer branch when agentBranchId is null', async () => {
      const customerId = 'CUSTOMER-123';

      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const result = await client.customers.setCustomerBranch({
        customerId,
        agentBranchId: null,
      });

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test.api.com/api/customers/${customerId}/branch`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ customerId, agentBranchId: null }),
        })
      );
    });
  });
});
