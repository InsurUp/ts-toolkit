import { CustomerType, DateOnly, DateTime } from '@insurup/contracts';
import type { GetCustomerResultIndividual } from '@insurup/contracts';

export const sampleCustomer: GetCustomerResultIndividual = {
  id: 'CUSTOMER-12345',
  type: CustomerType.Individual,
  fullName: 'John Doe',
  identityNumber: 12345678901,
  primaryEmail: 'john.doe@example.com',
  primaryPhoneNumber: { number: '5551234567', countryCode: 90 },
  birthDate: new DateOnly('1990-05-15'),
  createdAt: new DateTime('2024-01-15T10:30:00Z'),
  createdBy: { id: 'AGENT-789', name: 'Agent Smith', role: 'agent' },
};

export const sampleCustomerEmails = [
  { email: 'john.doe@example.com', primary: true },
  { email: 'john.backup@example.com', primary: false },
];
