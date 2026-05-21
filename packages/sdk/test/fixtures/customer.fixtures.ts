/**
 * @fileoverview Customer Test Fixtures
 * @description Shared test data for customer management operations
 */

import type {
  CreateCustomerRequestIndividual,
  GetCustomerResultIndividual,
} from '@insurup/contracts';
import { CustomerType } from '@insurup/contracts';
import { DateTime, DateOnly } from '@insurup/contracts';
import { createSuccess, type InsurUpResult } from '../../src/core/result';

/**
 * Customer request fixtures
 */
export const customerRequests = {
  validIndividualCustomer: (): CreateCustomerRequestIndividual => ({
    type: CustomerType.Individual,
    identityNumber: '12345678901',
    fullName: 'John Doe',
    birthDate: '1990-05-15',
    email: 'john.doe@example.com',
    phoneNumber: {
      number: '5551234567',
      countryCode: 90,
    },
    fillMissingFields: false,
  }),
} as const;

/**
 * Customer response fixtures
 */
export const customerResponses = {
  individualCustomer: (): GetCustomerResultIndividual => ({
    id: 'CUSTOMER-123',
    type: CustomerType.Individual,
    fullName: 'John Doe',
    identityNumber: 12345678901,
    primaryEmail: 'john.doe@example.com',
    primaryPhoneNumber: {
      number: '5551234567',
      countryCode: 90,
    },
    birthDate: new DateOnly('1990-05-15'),
    createdAt: new DateTime('2024-01-01T00:00:00Z'),
    createdBy: {
      id: 'AGENT-456',
      name: 'Agent Smith',
    },
    vehicleCount: 0,
    propertyCount: 0,
    proposalCount: 0,
    policyCount: 0,
    caseCount: 0,
    emailCount: 1,
    phoneCount: 1,
  }),
} as const;

/**
 * Customer result fixtures
 */
export const customerResults = {
  successfulCustomerRetrieval: () =>
    createSuccess(
      customerResponses.individualCustomer()
    ) as InsurUpResult<GetCustomerResultIndividual>,
} as const;
