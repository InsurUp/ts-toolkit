/**
 * Customer Management Example
 *
 * Demonstrates CRUD operations for customer management with the InsurUp SDK.
 */

import { DefaultInsurUpClient, Gender, CustomerType, getDataOrThrow } from '@insurup/sdk';
import type {
  CreateCustomerRequestIndividual,
  UpdateCustomerRequestIndividual,
} from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  tokenProvider: () => 'your-api-token-here',
});

// ============================================================================
// 1. Create a new customer
// ============================================================================

async function createCustomer() {
  const request: CreateCustomerRequestIndividual = {
    type: CustomerType.Individual,
    identityNumber: '12345678901',
    fullName: 'John Doe',
    birthDate: '1990-01-15',
    gender: Gender.Male,
    email: 'john.doe@example.com',
    phoneNumber: {
      countryCode: 90,
      number: '5551234567',
    },
    fillMissingFields: false,
  };

  const result = await client.customers.createCustomer(request);

  if (result.isSuccess) {
    console.log('Customer created with ID:', result.data.id);
    return result.data.id;
  } else {
    console.error('Failed to create customer:', result.message);
    return null;
  }
}

// ============================================================================
// 2. Get customer details
// ============================================================================

async function getCustomer(customerId: string) {
  const result = await client.customers.getCustomer(customerId);

  if (result.isSuccess) {
    const customer = result.data;
    // Handle different customer types
    if (customer.type === CustomerType.Company) {
      console.log(`Company: ${customer.title}`);
      console.log(`Tax Number: ${customer.taxNumber}`);
    } else {
      console.log(`Customer: ${customer.fullName}`);
      console.log(`National ID: ${customer.identityNumber}`);
    }
    return customer;
  } else {
    console.error('Customer not found:', result.message);
    return null;
  }
}

// ============================================================================
// 3. Update customer information
// ============================================================================

async function updateCustomer(customerId: string) {
  const request: UpdateCustomerRequestIndividual = {
    type: CustomerType.Individual,
    id: customerId,
    fullName: 'Jonathan Doe',
    fillMissingFields: false,
  };

  const result = await client.customers.updateCustomer(request);

  if (result.isSuccess) {
    console.log('Customer updated successfully');
  } else {
    console.error('Failed to update customer:', result.message);
  }
}

// ============================================================================
// 4. Manage customer emails
// ============================================================================

async function manageCustomerEmails(customerId: string) {
  // Get current emails
  const emailsResult = await client.customers.getCustomerEmails(customerId);
  if (emailsResult.isSuccess) {
    console.log('Current emails:', emailsResult.data);
  }

  // Add a new email
  await client.customers.addCustomerEmail({
    customerId,
    email: 'john.work@example.com',
  });

  // Change primary email
  await client.customers.changePrimaryCustomerEmail({
    customerId,
    email: 'john.work@example.com',
  });
}

// ============================================================================
// 5. Manage customer phone numbers
// ============================================================================

async function manageCustomerPhones(customerId: string) {
  // Get current phone numbers
  const phonesResult = await client.customers.getCustomerPhoneNumbers(customerId);
  if (phonesResult.isSuccess) {
    console.log('Current phones:', phonesResult.data);
  }

  // Add a new phone number
  await client.customers.addCustomerPhoneNumber({
    customerId,
    phoneNumber: {
      countryCode: 90,
      number: '5559876543',
    },
  });
}

// ============================================================================
// 6. Manage customer addresses
// ============================================================================

async function manageCustomerAddresses(customerId: string) {
  // Create a new address
  const createResult = await client.customers.createCustomerAddress({
    customerId,
    propertyNumber: 123456,
    type: 'HOME',
  });

  if (createResult.isSuccess) {
    const addressId = createResult.data.addressId;
    console.log('Address created:', addressId);

    // Get all addresses
    const addressesResult = await client.customers.getCustomerAddresses(customerId);
    if (addressesResult.isSuccess) {
      console.log(`Customer has ${addressesResult.data.length} addresses`);
    }

    // Update address type
    await client.customers.updateCustomerAddress({
      customerId,
      addressId,
      type: 'WORK',
    });
  }
}

// ============================================================================
// 7. Manage customer health info (for health insurance)
// ============================================================================

async function manageHealthInfo(customerId: string) {
  // Get current health info
  const healthResult = await client.customers.getCustomerHealthInfo(customerId);
  if (healthResult.isSuccess) {
    console.log('Current health info:', healthResult.data);
  }

  // Update health info
  await client.customers.updateCustomerHealthInfo({
    customerId,
    height: 180,
    weight: 75,
    surgeries: [],
    diseases: [],
  });
}

// ============================================================================
// 8. Using getDataOrThrow for simpler error handling
// ============================================================================

async function createCustomerWithThrow() {
  // This will throw an InsurUpError if the request fails
  const customer = getDataOrThrow(
    await client.customers.createCustomer({
      type: CustomerType.Individual,
      identityNumber: '98765432109',
      fullName: 'Jane Smith',
      birthDate: '1985-06-20',
      gender: Gender.Female,
      fillMissingFields: false,
    })
  );

  console.log('Created customer:', customer.id);
  return customer;
}

// ============================================================================
// 9. Delete a customer
// ============================================================================

async function deleteCustomer(customerId: string) {
  const result = await client.customers.deleteCustomer(customerId);

  if (result.isSuccess) {
    console.log('Customer deleted successfully');
  } else {
    console.error('Failed to delete customer:', result.message);
  }
}

// ============================================================================
// Run the example
// ============================================================================

async function main() {
  const customerId = await createCustomer();
  if (!customerId) return;

  await getCustomer(customerId);
  await updateCustomer(customerId);
  await manageCustomerEmails(customerId);
  await manageCustomerPhones(customerId);
  await manageCustomerAddresses(customerId);
  await manageHealthInfo(customerId);

  // Cleanup
  // await deleteCustomer(customerId);
}

// Suppress unused variable warnings for demonstration functions
void createCustomerWithThrow;
void deleteCustomer;

main().catch(console.error);
