/**
 * @fileoverview InsurUp API Endpoints - API endpoint definitions
 * @description API endpoint definitions with identical names and render functions
 */

import type { ConsentType, VehicleUtilizationStyle } from '@insurup/contracts';
import { VehicleUtilizationStyleOrdinal } from '@insurup/contracts';

/**
 * Contact form endpoints
 */
export const contactForm = {
  submit: 'contact-form',
} as const;

/**
 * Agent management endpoints
 */
export const agents = {
  getCurrentAgent: 'agents/me',
  updateCurrentAgent: 'agents/me',
  reSyncCurrentAgentWithInsurance: 'agents/me/re-sync',

  insuranceCompanies: {
    getMyInsuranceCompanies: 'agents/me/insurance-companies',
    addInsuranceCompanyToAgent: 'agents/me/insurance-companies',

    getBranches: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}/branches',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}/branches'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },

    getConnection: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}/connection',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}/connection'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },

    updateConnection: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}/connection',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}/connection'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },

    updateBranches: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}/branches',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}/branches'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },

    reSyncAgentInsuranceCompanyWithInsurance: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}/re-sync',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}/re-sync'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },

    remove: {
      definition: 'agents/me/insurance-companies/{AgentInsuranceCompanyId}',
      render: (agentInsuranceCompanyId: string): string =>
        'agents/me/insurance-companies/{AgentInsuranceCompanyId}'.replace(
          '{AgentInsuranceCompanyId}',
          encodeURIComponent(agentInsuranceCompanyId)
        ),
    },
  },
} as const;

/**
 * Insurance company endpoints
 */
export const insuranceCompanies = {
  getInsuranceCompanies: 'insurance-companies',

  getInsuranceCompanyProducts: {
    definition: 'insurance-companies/{InsuranceCompanyId}/products',
    render: (insuranceCompanyId: number): string =>
      'insurance-companies/{InsuranceCompanyId}/products'.replace(
        '{InsuranceCompanyId}',
        encodeURIComponent(insuranceCompanyId.toString())
      ),
  },

  connectionFields: {
    getAgentBasedConnectionFieldsByCompanyId: {
      definition: 'insurance-companies/{InsuranceCompanyId}/connection-fields:agent-based',
      render: (insuranceCompanyId: number): string =>
        'insurance-companies/{InsuranceCompanyId}/connection-fields:agent-based'.replace(
          '{InsuranceCompanyId}',
          encodeURIComponent(insuranceCompanyId.toString())
        ),
    },
  },
} as const;

/**
 * Insurance product endpoints
 */
export const products = {
  getAll: 'products',
} as const;

/**
 * Resource keys endpoints
 */
export const resourceKeys = {
  getAll: 'resource-keys',
} as const;

/**
 * Customer management endpoints
 */
export const customers = {
  createCustomer: 'customers',
  getCurrentCustomer: 'customers/me',
  externalLookup: 'customers/external-lookup',

  setCustomerRepresentative: {
    definition: 'customers/{CustomerId}/representative',
    render: (customerId: string): string =>
      'customers/{CustomerId}/representative'.replace(
        '{CustomerId}',
        encodeURIComponent(customerId)
      ),
  },

  getCustomer: {
    definition: 'customers/{CustomerId}',
    render: (customerId: string): string =>
      'customers/{CustomerId}'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  updateCustomer: {
    definition: 'customers/{CustomerId}',
    render: (customerId: string): string =>
      'customers/{CustomerId}'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  deleteCustomer: {
    definition: 'customers/{CustomerId}',
    render: (customerId: string): string =>
      'customers/{CustomerId}'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  getCustomerAssets: {
    definition: 'customers/{CustomerId}/assets',
    render: (customerId: string): string =>
      'customers/{CustomerId}/assets'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  getHealthInfo: {
    definition: 'customers/{CustomerId}/health-info',
    render: (customerId: string): string =>
      'customers/{CustomerId}/health-info'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  updateHealthInfo: {
    definition: 'customers/{CustomerId}/health-info',
    render: (customerId: string): string =>
      'customers/{CustomerId}/health-info'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  emails: {
    addCustomerEmail: {
      definition: 'customers/{CustomerId}/emails',
      render: (customerId: string): string =>
        'customers/{CustomerId}/emails'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },

    removeCustomerEmail: {
      definition: 'customers/{CustomerId}/emails/{Email}',
      render: (request: { customerId: string; email: string }): string =>
        'customers/{CustomerId}/emails/{Email}'
          .replace('{CustomerId}', encodeURIComponent(request.customerId))
          .replace('{Email}', encodeURIComponent(request.email)),
    },

    changePrimaryCustomerEmail: {
      definition: 'customers/{CustomerId}/emails/{Email}/primary',
      render: (request: { customerId: string; email: string }): string =>
        'customers/{CustomerId}/emails/{Email}/primary'
          .replace('{CustomerId}', encodeURIComponent(request.customerId))
          .replace('{Email}', encodeURIComponent(request.email)),
    },

    getCustomerEmails: {
      definition: 'customers/{CustomerId}/emails',
      render: (customerId: string): string =>
        'customers/{CustomerId}/emails'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },

    getPrimaryCustomerEmail: {
      definition: 'customers/{CustomerId}/emails/primary',
      render: (customerId: string): string =>
        'customers/{CustomerId}/emails/primary'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },

    setPrimaryCustomerEmail: {
      definition: 'customers/{CustomerId}/emails/primary',
      render: (customerId: string): string =>
        'customers/{CustomerId}/emails/primary'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },
  },

  phoneNumbers: {
    addCustomerPhoneNumber: {
      definition: 'customers/{CustomerId}/phone-numbers',
      render: (customerId: string): string =>
        'customers/{CustomerId}/phone-numbers'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },

    removeCustomerPhoneNumber: {
      definition: 'customers/{CustomerId}/phone-numbers/{CountryCode}-{PhoneNumber}',
      render: (request: { customerId: string; countryCode: number; phoneNumber: string }): string =>
        'customers/{CustomerId}/phone-numbers/{CountryCode}-{PhoneNumber}'
          .replace('{CustomerId}', encodeURIComponent(request.customerId))
          .replace('{CountryCode}', encodeURIComponent(request.countryCode.toString()))
          .replace('{PhoneNumber}', encodeURIComponent(request.phoneNumber)),
    },

    changePrimaryCustomerPhoneNumber: {
      definition: 'customers/{CustomerId}/phone-numbers/{CountryCode}-{PhoneNumber}/primary',
      render: (request: { customerId: string; countryCode: number; phoneNumber: string }): string =>
        'customers/{CustomerId}/phone-numbers/{CountryCode}-{PhoneNumber}/primary'
          .replace('{CustomerId}', encodeURIComponent(request.customerId))
          .replace('{CountryCode}', encodeURIComponent(request.countryCode.toString()))
          .replace('{PhoneNumber}', encodeURIComponent(request.phoneNumber)),
    },

    getCustomerPhoneNumbers: {
      definition: 'customers/{CustomerId}/phone-numbers',
      render: (customerId: string): string =>
        'customers/{CustomerId}/phone-numbers'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },

    getPrimaryCustomerPhoneNumber: {
      definition: 'customers/{CustomerId}/phone-numbers/primary',
      render: (customerId: string): string =>
        'customers/{CustomerId}/phone-numbers/primary'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },

    setPrimaryCustomerPhoneNumber: {
      definition: 'customers/{CustomerId}/phone-numbers/primary',
      render: (customerId: string): string =>
        'customers/{CustomerId}/phone-numbers/primary'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },
  },

  contactFlows: {
    getCustomerContactFlows: {
      definition: 'customers/{CustomerId}/contact-flows',
      render: (customerId: string, caseRef?: string | null): string => {
        const base = 'customers/{CustomerId}/contact-flows'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        );
        return caseRef ? base + '?caseRef=' + encodeURIComponent(caseRef) : base;
      },
    },

    createContactFlow: {
      definition: 'customers/{CustomerId}/contact-flows',
      render: (customerId: string): string =>
        'customers/{CustomerId}/contact-flows'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        ),
    },

    endContactFlow: {
      definition: 'customers/{CustomerId}/contact-flows/{ContactFlowId}/end',
      render: (customerId: string, contactFlowId: string): string =>
        'customers/{CustomerId}/contact-flows/{ContactFlowId}/end'
          .replace('{CustomerId}', encodeURIComponent(customerId))
          .replace('{ContactFlowId}', encodeURIComponent(contactFlowId)),
    },
  },

  contacts: {
    getCustomerContacts: {
      definition: 'customers/{CustomerId}/contacts',
      render: (customerId: string, caseRef?: string | null): string => {
        const base = 'customers/{CustomerId}/contacts'.replace(
          '{CustomerId}',
          encodeURIComponent(customerId)
        );
        return caseRef ? base + '?caseRef=' + encodeURIComponent(caseRef) : base;
      },
    },

    create: {
      definition: 'customers/{CustomerId}/contacts',
      render: (customerId: string): string =>
        'customers/{CustomerId}/contacts'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },
  },

  setCustomerBranch: {
    definition: 'customers/{CustomerId}/branch',
    render: (customerId: string): string =>
      'customers/{CustomerId}/branch'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  addresses: {
    create: {
      definition: 'customers/{CustomerId}/addresses',
      render: (customerId: string): string =>
        'customers/{CustomerId}/addresses'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },
    update: {
      definition: 'customers/{CustomerId}/addresses/{AddressId}',
      render: (customerId: string, addressId: string): string =>
        'customers/{CustomerId}/addresses/{AddressId}'
          .replace('{CustomerId}', encodeURIComponent(customerId))
          .replace('{AddressId}', encodeURIComponent(addressId)),
    },
    getById: {
      definition: 'customers/{CustomerId}/addresses/{AddressId}',
      render: (customerId: string, addressId: string): string =>
        'customers/{CustomerId}/addresses/{AddressId}'
          .replace('{CustomerId}', encodeURIComponent(customerId))
          .replace('{AddressId}', encodeURIComponent(addressId)),
    },
    getAll: {
      definition: 'customers/{CustomerId}/addresses',
      render: (customerId: string): string =>
        'customers/{CustomerId}/addresses'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },
    delete: {
      definition: 'customers/{CustomerId}/addresses/{AddressId}',
      render: (customerId: string, addressId: string): string =>
        'customers/{CustomerId}/addresses/{AddressId}'
          .replace('{CustomerId}', encodeURIComponent(customerId))
          .replace('{AddressId}', encodeURIComponent(addressId)),
    },
  },

  consents: {
    give: {
      definition: 'customers/{CustomerId}/consents',
      render: (customerId: string): string =>
        'customers/{CustomerId}/consents'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },
    revoke: {
      definition: 'customers/{CustomerId}/consents/{ConsentType}',
      render: (customerId: string, consentType: ConsentType): string =>
        'customers/{CustomerId}/consents/{ConsentType}'
          .replace('{CustomerId}', encodeURIComponent(customerId))
          .replace('{ConsentType}', encodeURIComponent(consentType)),
    },
    getAll: {
      definition: 'customers/{CustomerId}/consents',
      render: (customerId: string): string =>
        'customers/{CustomerId}/consents'.replace('{CustomerId}', encodeURIComponent(customerId)),
    },
  },
} as const;

/**
 * Address parameter endpoints
 */
export const addressParameters = {
  queryCities: 'address-parameters/cities',

  queryDistricts: {
    definition: 'address-parameters/districts',
    render: (request: { cityReference: string }): string =>
      'address-parameters/districts?cityReference={cityReference}'.replace(
        '{cityReference}',
        request.cityReference
      ),
  },

  queryTowns: {
    definition: 'address-parameters/towns',
    render: (request: { districtReference: string }): string =>
      'address-parameters/towns?districtReference={districtReference}'.replace(
        '{districtReference}',
        request.districtReference
      ),
  },

  queryNeighbourhoods: {
    definition: 'address-parameters/neighbourhoods',
    render: (request: { townReference: string }): string =>
      'address-parameters/neighbourhoods?townReference={townReference}'.replace(
        '{townReference}',
        request.townReference
      ),
  },

  queryStreets: {
    definition: 'address-parameters/streets',
    render: (request: { neighbourhoodReference: string }): string =>
      'address-parameters/streets?neighbourhoodReference={neighbourhoodReference}'.replace(
        '{neighbourhoodReference}',
        request.neighbourhoodReference
      ),
  },

  queryBuildings: {
    definition: 'address-parameters/buildings',
    render: (request: { streetReference: string }): string =>
      'address-parameters/buildings?streetReference={streetReference}'.replace(
        '{streetReference}',
        request.streetReference
      ),
  },

  queryApartments: {
    definition: 'address-parameters/apartments',
    render: (request: { buildingReference: string }): string =>
      'address-parameters/apartments?buildingReference={buildingReference}'.replace(
        '{buildingReference}',
        request.buildingReference
      ),
  },
} as const;

/**
 * Vehicle parameter endpoints
 */
export const vehicleParameters = {
  queryBrands: 'vehicle-parameters/brands',

  queryModels: {
    definition: 'vehicle-parameters/models',
    render: (request: { brandReference: string; year: number }): string =>
      'vehicle-parameters/models?brandReference={brandReference}&year={year}'
        .replace('{brandReference}', encodeURIComponent(request.brandReference))
        .replace('{year}', encodeURIComponent(request.year.toString())),
  },
} as const;

/**
 * Vehicle endpoints
 */
export const vehicles = {
  getCurrentCustomerVehicles: 'customers/me/vehicles',

  externalLookup: {
    definition: 'customers/{CustomerId}/vehicles/external-lookup',
    render: (customerId: string): string =>
      'customers/{CustomerId}/vehicles/external-lookup'.replace(
        '{CustomerId}',
        encodeURIComponent(customerId)
      ),
  },

  create: {
    definition: 'customers/{CustomerId}/vehicles',
    render: (customerId: string): string =>
      'customers/{CustomerId}/vehicles'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  update: {
    definition: 'customers/{CustomerId}/vehicles/{VehicleId}',
    render: (customerId: string, vehicleId: string): string =>
      'customers/{CustomerId}/vehicles/{VehicleId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{VehicleId}', encodeURIComponent(vehicleId)),
  },

  delete: {
    definition: 'customers/{CustomerId}/vehicles/{VehicleId}',
    render: (customerId: string, vehicleId: string): string =>
      'customers/{CustomerId}/vehicles/{VehicleId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{VehicleId}', encodeURIComponent(vehicleId)),
  },

  get: {
    definition: 'customers/{CustomerId}/vehicles/{VehicleId}',
    render: (customerId: string, vehicleId: string): string =>
      'customers/{CustomerId}/vehicles/{VehicleId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{VehicleId}', encodeURIComponent(vehicleId)),
  },

  getCustomerVehicles: {
    definition: 'customers/{CustomerId}/vehicles',
    render: (customerId: string): string =>
      'customers/{CustomerId}/vehicles'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },
} as const;

/**
 * Insurance services endpoints
 */
export const insuranceServices = {
  queryVehicleByBrandCode: 'insurance-services/query-vehicle-by-brand-code',
} as const;

/**
 * Property endpoints
 */
export const properties = {
  getPropertyAddressByPropertyNumber: 'properties/query-address-by-property-number',
  queryPropertyByDaskOldPolicy: 'properties/query-property-by-dask-old-policy',
  getCurrentCustomerProperties: 'customers/me/properties',

  getAll: {
    definition: 'customers/{CustomerId}/properties',
    render: (customerId: string): string =>
      'customers/{CustomerId}/properties'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  create: {
    definition: 'customers/{CustomerId}/properties',
    render: (customerId: string): string =>
      'customers/{CustomerId}/properties'.replace('{CustomerId}', encodeURIComponent(customerId)),
  },

  getById: {
    definition: 'customers/{CustomerId}/properties/{PropertyId}',
    render: (customerId: string, propertyId: string): string =>
      'customers/{CustomerId}/properties/{PropertyId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{PropertyId}', encodeURIComponent(propertyId)),
  },

  update: {
    definition: 'customers/{CustomerId}/properties/{PropertyId}',
    render: (customerId: string, propertyId: string): string =>
      'customers/{CustomerId}/properties/{PropertyId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{PropertyId}', encodeURIComponent(propertyId)),
  },

  delete: {
    definition: 'customers/{CustomerId}/properties/{PropertyId}',
    render: (customerId: string, propertyId: string): string =>
      'customers/{CustomerId}/properties/{PropertyId}'
        .replace('{CustomerId}', encodeURIComponent(customerId))
        .replace('{PropertyId}', encodeURIComponent(propertyId)),
  },
} as const;

/**
 * Proposal endpoints
 */
export const proposals = {
  create: 'proposals',

  getProposalById: {
    definition: 'proposals/{ProposalId}',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}'.replace('{ProposalId}', encodeURIComponent(proposalId)),
  },

  getProposalSnapshot: {
    definition: 'proposals/{ProposalId}/snapshot',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/snapshot'.replace('{ProposalId}', encodeURIComponent(proposalId)),
  },

  getProposalCoverage: {
    definition: 'proposals/{ProposalId}/coverage',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/coverage'.replace('{ProposalId}', encodeURIComponent(proposalId)),
  },

  getProposalProductCoverage: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/coverage',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/coverage'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  retryFailedProposalProduct: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/retry',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/retry'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  getProposalProductPremiumDetail: {
    definition:
      'proposals/{ProposalId}/products/{ProposalProductId}/premium-detail/{InstallmentNumber}',
    render: (proposalId: string, proposalProductId: string, installmentNumber: number): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/premium-detail/{InstallmentNumber}'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId))
        .replace('{InstallmentNumber}', encodeURIComponent(installmentNumber.toString())),
  },

  purchaseProposalProductSync: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/purchase/sync',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/purchase/sync'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  purchaseProposalProductAsync: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/purchase/async',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/purchase/async'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  reviseProposal: {
    definition: 'proposals/{ProposalId}/revise',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/revise'.replace('{ProposalId}', encodeURIComponent(proposalId)),
  },

  reviseProposalProduct: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/revise',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/revise'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  fetchProposalProductDocument: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/document',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/document'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  fetchProposalInformationFormDocument: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/information-form',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/information-form'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  sendProposalProductDocument: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/document/send',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/document/send'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  sendProposalInformationFormDocument: {
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/information-form/send',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/information-form/send'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId)),
  },

  generateCompareProposalProductsPdf: {
    definition: 'proposals/{ProposalId}/products/compare-pdf',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/products/compare-pdf'.replace(
        '{ProposalId}',
        encodeURIComponent(proposalId)
      ),
  },

  sendCompareProposalProductsPdf: {
    definition: 'proposals/{ProposalId}/products/compare-pdf/send',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/products/compare-pdf/send'.replace(
        '{ProposalId}',
        encodeURIComponent(proposalId)
      ),
  },

  setProposalRepresentative: {
    definition: 'proposals/{ProposalId}/representative',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/representative'.replace(
        '{ProposalId}',
        encodeURIComponent(proposalId)
      ),
  },

  setProposalBranch: {
    definition: 'proposals/{ProposalId}/branch',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/branch'.replace('{ProposalId}', encodeURIComponent(proposalId)),
  },

  generateCustomerProposalDocumentPdf: {
    definition: 'proposals/{ProposalId}/customer-document-pdf',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/customer-document-pdf'.replace(
        '{ProposalId}',
        encodeURIComponent(proposalId)
      ),
  },

  getProposalConversionTrend: {
    definition: 'proposals/analytics/conversion-trend',
  },
} as const;

/**
 * Policy endpoints
 */
export const policies = {
  getPolicyDetail: {
    definition: 'policies/{PolicyId}',
    render: (policyId: string): string =>
      'policies/{PolicyId}'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  fetchPolicyDocument: {
    definition: 'policies/{PolicyId}/document',
    render: (policyId: string): string =>
      'policies/{PolicyId}/document'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  sendPolicyDocument: {
    definition: 'policies/{PolicyId}/document/send',
    render: (policyId: string): string =>
      'policies/{PolicyId}/document/send'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  setPolicyRepresentative: {
    definition: 'policies/{PolicyId}/representative',
    render: (policyId: string): string =>
      'policies/{PolicyId}/representative'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  setPolicyBranch: {
    definition: 'policies/{PolicyId}/branch',
    render: (policyId: string): string =>
      'policies/{PolicyId}/branch'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  createManualPolicy: {
    definition: 'policies/manual',
  },

  updateManualPolicy: {
    definition: 'policies/manual/{PolicyId}',
    render: (policyId: string): string =>
      'policies/manual/{PolicyId}'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  getPolicyCountAndPremiumAnalytics: {
    definition: 'policies/analytics/count-and-premium',
  },

  getPolicyRenewalAnalytics: {
    definition: 'policies/analytics/renewal',
  },

  getPolicyDistributionByBranch: {
    definition: 'policies/analytics/distribution-by-branch',
  },

  getRepresentativeEarningsAnalytics: {
    definition: 'policies/analytics/representative-earnings',
  },
} as const;

/**
 * Policy transfer endpoints
 */
export const policyTransfers = {
  create: 'policy-transfers',

  getPolicyTransferDetail: {
    definition: 'policy-transfers/{PolicyTransferId}',
    render: (policyTransferId: string): string =>
      'policy-transfers/{PolicyTransferId}'.replace(
        '{PolicyTransferId}',
        encodeURIComponent(policyTransferId)
      ),
  },

  getPolicyTransferTriggerDetail: {
    definition: 'policy-transfers/{PolicyTransferId}/triggers/{PolicyTransferTriggerId}',
    render: (policyTransferId: string, policyTransferTriggerId: string): string =>
      'policy-transfers/{PolicyTransferId}/triggers/{PolicyTransferTriggerId}'
        .replace('{PolicyTransferId}', encodeURIComponent(policyTransferId))
        .replace('{PolicyTransferTriggerId}', encodeURIComponent(policyTransferTriggerId)),
  },

  triggerPolicyTransfer: {
    definition: 'policy-transfers/{PolicyTransferId}/trigger',
    render: (policyTransferId: string): string =>
      'policy-transfers/{PolicyTransferId}/trigger'.replace(
        '{PolicyTransferId}',
        encodeURIComponent(policyTransferId)
      ),
  },
} as const;

/**
 * File policy transfer endpoints
 */
export const filePolicyTransfers = {
  create: 'file-policy-transfers',

  getFilePolicyTransferDetail: {
    definition: 'file-policy-transfers/{FilePolicyTransferId}',
    render: (filePolicyTransferId: string): string =>
      'file-policy-transfers/{FilePolicyTransferId}'.replace(
        '{FilePolicyTransferId}',
        encodeURIComponent(filePolicyTransferId)
      ),
  },
} as const;

/**
 * Coverage choice endpoints
 */
export const coverageChoices = {
  getKaskoCoverageChoices: {
    definition: 'coverage-choices:kasko',
    // The backend binds the enum from the query string by its integer ordinal,
    // not its JSON wire value (see InsurUpApiEndpoints.cs / issue #69), so send
    // the ordinal — sending the string (PRIVATE_CAR) fails model binding → 400.
    render: (vehicleUtilizationStyle?: VehicleUtilizationStyle): string =>
      vehicleUtilizationStyle !== undefined
        ? `coverage-choices:kasko?vehicleUtilizationStyle=${VehicleUtilizationStyleOrdinal[vehicleUtilizationStyle]}`
        : 'coverage-choices:kasko',
  },

  getKonutCoverageChoices: {
    definition: 'coverage-choices:konut',
    render: (): string => 'coverage-choices:konut',
  },

  getImmCoverageChoices: {
    definition: 'coverage-choices:imm',
    render: (): string => 'coverage-choices:imm',
  },

  getTssCoverageChoices: {
    definition: 'coverage-choices:tss',
    render: (): string => 'coverage-choices:tss',
  },

  getOssCoverageChoices: {
    definition: 'coverage-choices:oss',
    render: (): string => 'coverage-choices:oss',
  },

  getSeyahatSaglikCoverageChoices: {
    definition: 'coverage-choices:seyahat-saglik',
    render: (): string => 'coverage-choices:seyahat-saglik',
  },

  getYabanciSaglikCoverageChoices: {
    definition: 'coverage-choices:yabanci-saglik',
    render: (): string => 'coverage-choices:yabanci-saglik',
  },
} as const;

/**
 * Agent setup request endpoints
 */
export const agentSetupRequests = {
  complete: 'agent-setup-requests/complete',
  create: 'agent-setup-requests',
  getAll: 'agent-setup-requests',
  enter: 'agent-setup-requests/enter',

  getAgentSetupRequestById: {
    definition: 'agent-setup-requests/{Id}',
    render: (id: string): string =>
      'agent-setup-requests/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  disableAgentSetupRequest: {
    definition: 'agent-setup-requests/{Id}/disable',
    render: (id: string): string =>
      'agent-setup-requests/{Id}/disable'.replace('{Id}', encodeURIComponent(id)),
  },
} as const;

/**
 * Agent user endpoints
 */
export const agentUsers = {
  forgotPassword: 'agent-users/forgot-password',
  resetPassword: 'agent-users/reset-password',
  checkAgentUserForgotPasswordToken: 'agent-users/check-forgot-password-token',
  me: 'agent-users/me',
  meRobotCode: 'agent-users/me/robot-code',
  invite: 'agent-users/invite',
  updateMyUser: 'agent-users/me',
  acceptInvite: 'agent-users/accept-invite',
  updatePassword: 'agent-users/me/password',

  reSendInvite: {
    definition: 'agent-users/{AgentUserId}/re-send-invite',
    render: (userId: string): string =>
      'agent-users/{AgentUserId}/re-send-invite'.replace(
        '{AgentUserId}',
        encodeURIComponent(userId)
      ),
  },

  deactivate: {
    definition: 'agent-users/{AgentUserId}/deactivate',
    render: (userId: string): string =>
      'agent-users/{AgentUserId}/deactivate'.replace('{AgentUserId}', encodeURIComponent(userId)),
  },

  activate: {
    definition: 'agent-users/{AgentUserId}/activate',
    render: (userId: string): string =>
      'agent-users/{AgentUserId}/activate'.replace('{AgentUserId}', encodeURIComponent(userId)),
  },

  delete: {
    definition: 'agent-users/{UserId}',
    render: (userId: string): string =>
      'agent-users/{UserId}'.replace('{UserId}', encodeURIComponent(userId)),
  },

  getById: {
    definition: 'agent-users/{UserId}',
    render: (userId: string): string =>
      'agent-users/{UserId}'.replace('{UserId}', encodeURIComponent(userId)),
  },

  checkAgentUserInviteCode: {
    definition: 'agent-users/check-invite-code',
    render: (code: string): string =>
      'agent-users/check-invite-code?code={code}'.replace('{code}', encodeURIComponent(code)),
  },

  update: {
    definition: 'agent-users/{Id}',
    render: (userId: string): string =>
      'agent-users/{Id}'.replace('{Id}', encodeURIComponent(userId)),
  },

  migrate: {
    definition: 'agent-users/{AgentUserId}/migrate',
    render: (agentUserId: string): string =>
      'agent-users/{AgentUserId}/migrate'.replace('{AgentUserId}', encodeURIComponent(agentUserId)),
  },

  migrateAll: 'agent-users/migrate-all',
} as const;

/**
 * Agent role endpoints
 */
export const agentRoles = {
  getAll: 'agent-roles',
  create: 'agent-roles',

  update: {
    definition: 'agent-roles/{Id}',
    render: (agentRoleId: string): string =>
      'agent-roles/{Id}'.replace('{Id}', encodeURIComponent(agentRoleId)),
  },

  delete: {
    definition: 'agent-roles/{Id}',
    render: (agentRoleId: string): string =>
      'agent-roles/{Id}'.replace('{Id}', encodeURIComponent(agentRoleId)),
  },

  getById: {
    definition: 'agent-roles/{Id}',
    render: (agentRoleId: string): string =>
      'agent-roles/{Id}'.replace('{Id}', encodeURIComponent(agentRoleId)),
  },
} as const;

/**
 * Webhook endpoints
 */
export const webhooks = {
  getAll: 'webhooks',
  create: 'webhooks',

  getById: {
    definition: 'webhooks/{Id}',
    render: (id: string): string => 'webhooks/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  update: {
    definition: 'webhooks/{Id}',
    render: (id: string): string => 'webhooks/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  delete: {
    definition: 'webhooks/{Id}',
    render: (id: string): string => 'webhooks/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  deliveries: {
    getById: {
      definition: 'webhooks/{WebhookId}/deliveries/{WebhookDeliveryId}',
      render: (webhookId: string, webhookDeliveryId: string): string =>
        'webhooks/{WebhookId}/deliveries/{WebhookDeliveryId}'
          .replace('{WebhookId}', encodeURIComponent(webhookId))
          .replace('{WebhookDeliveryId}', encodeURIComponent(webhookDeliveryId)),
    },

    redeliver: {
      definition: 'webhooks/{WebhookId}/deliveries/{WebhookDeliveryId}/redeliver',
      render: (webhookId: string, webhookDeliveryId: string): string =>
        'webhooks/{WebhookId}/deliveries/{WebhookDeliveryId}/redeliver'
          .replace('{WebhookId}', encodeURIComponent(webhookId))
          .replace('{WebhookDeliveryId}', encodeURIComponent(webhookDeliveryId)),
    },
  },
} as const;

/**
 * Plugin management endpoints
 */
export const plugins = {
  getAll: 'plugins',
  upload: 'plugins',

  getById: {
    definition: 'plugins/{PluginId}',
    render: (pluginId: string): string =>
      'plugins/{PluginId}'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  activate: {
    definition: 'plugins/{PluginId}/activate',
    render: (pluginId: string): string =>
      'plugins/{PluginId}/activate'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  enable: {
    definition: 'plugins/{PluginId}/enable',
    render: (pluginId: string): string =>
      'plugins/{PluginId}/enable'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  disable: {
    definition: 'plugins/{PluginId}/disable',
    render: (pluginId: string): string =>
      'plugins/{PluginId}/disable'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  updateConfig: {
    definition: 'plugins/{PluginId}/config',
    render: (pluginId: string): string =>
      'plugins/{PluginId}/config'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  setPriority: {
    definition: 'plugins/{PluginId}/priority',
    render: (pluginId: string): string =>
      'plugins/{PluginId}/priority'.replace('{PluginId}', encodeURIComponent(pluginId)),
  },

  logs: {
    definition: 'plugins/{PluginId}/logs',
    render: (pluginId: string, options?: { limit?: number; hookName?: string }): string => {
      const base = 'plugins/{PluginId}/logs'.replace('{PluginId}', encodeURIComponent(pluginId));
      const query: string[] = [];
      if (options?.limit !== undefined) {
        query.push('limit=' + encodeURIComponent(options.limit.toString()));
      }
      if (options?.hookName !== undefined) {
        query.push('hookName=' + encodeURIComponent(options.hookName));
      }
      return query.length > 0 ? base + '?' + query.join('&') : base;
    },
  },
} as const;

/**
 * OAuth client management endpoints
 */
export const oauthClients = {
  getAll: 'oauth-clients',
  create: 'oauth-clients',

  getById: {
    definition: 'oauth-clients/{Id}',
    render: (id: string): string => 'oauth-clients/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  update: {
    definition: 'oauth-clients/{Id}',
    render: (id: string): string => 'oauth-clients/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  delete: {
    definition: 'oauth-clients/{Id}',
    render: (id: string): string => 'oauth-clients/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },
} as const;

/**
 * Case management endpoints
 */
export const cases = {
  createNewSaleOpportunity: 'cases:new-sale-opportunity',
  createCrossSaleOpportunity: 'cases:cross-sale-opportunity',
  createCancel: 'cases:cancel',
  createEndorsement: 'cases:endorsement',
  createComplaint: 'cases:complaint',

  assignRepresentative: {
    definition: 'cases/{Ref}/representative',
    render: (ref: string): string =>
      'cases/{Ref}/representative'.replace('{Ref}', encodeURIComponent(ref)),
  },

  addNoteToCase: {
    definition: 'cases/{Ref}/notes',
    render: (ref: string): string => 'cases/{Ref}/notes'.replace('{Ref}', encodeURIComponent(ref)),
  },

  changeChannel: {
    definition: 'cases/{Ref}/channel',
    render: (ref: string): string =>
      'cases/{Ref}/channel'.replace('{Ref}', encodeURIComponent(ref)),
  },

  changeState: {
    definition: 'cases/{Ref}/state',
    render: (ref: string): string => 'cases/{Ref}/state'.replace('{Ref}', encodeURIComponent(ref)),
  },

  getActivities: {
    definition: 'cases/{Ref}/activities',
    render: (ref: string): string =>
      'cases/{Ref}/activities'.replace('{Ref}', encodeURIComponent(ref)),
  },

  getCaseByRef: {
    definition: 'cases/{Ref}',
    render: (ref: string): string => 'cases/{Ref}'.replace('{Ref}', encodeURIComponent(ref)),
  },

  getProposals: {
    definition: 'cases/{Ref}/proposals',
    render: (ref: string): string =>
      'cases/{Ref}/proposals'.replace('{Ref}', encodeURIComponent(ref)),
  },

  getPolicies: {
    definition: 'cases/{Ref}/policies',
    render: (ref: string): string =>
      'cases/{Ref}/policies'.replace('{Ref}', encodeURIComponent(ref)),
  },

  setAsset: {
    definition: 'cases/{Ref}/asset',
    render: (ref: string): string => 'cases/{Ref}/asset'.replace('{Ref}', encodeURIComponent(ref)),
  },

  setBranch: {
    definition: 'cases/{Ref}/branch',
    render: (ref: string): string => 'cases/{Ref}/branch'.replace('{Ref}', encodeURIComponent(ref)),
  },

  getSalesOpportunityFunnelAnalytics: {
    definition: 'cases/analytics/sales-opportunity-funnel',
  },

  getOpenCaseBacklogPivotAnalytics: {
    definition: 'cases/analytics/open-case-backlog-pivot',
  },

  getFailedCasesReasonDistribution: {
    definition: 'cases/analytics/failed-cases-reason-distribution',
  },

  communicationAutomations: {
    getAll: 'cases/communication-automations',
  },

  getPriorityTemplates: 'cases/priority-templates',
} as const;

/**
 * Coverage Groups endpoints for managing insurance coverage groups
 * Sigorta teminat gruplarını yönetmek için teminat grupları endpoint'leri
 */
export const coverageGroups = {
  getAll: 'coverage-groups',
  create: 'coverage-groups',

  update: {
    definition: 'coverage-groups/{Id}',
    render: (id: string): string => 'coverage-groups/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  delete: {
    definition: 'coverage-groups/{Id}',
    render: (id: string): string => 'coverage-groups/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },

  getById: {
    definition: 'coverage-groups/{Id}',
    render: (id: string): string => 'coverage-groups/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },
} as const;

/**
 * Release Notes endpoints
 */
export const releaseNotes = {
  getAll: 'release-notes',
} as const;

/**
 * Banks endpoints
 */
export const banks = {
  getAll: 'banks',

  getBranches: {
    definition: 'banks/{BankId}/branches',
    render: (bankId: string): string =>
      'banks/{BankId}/branches'.replace('{BankId}', encodeURIComponent(bankId)),
  },
} as const;

/**
 * Financial Institutions endpoints
 */
export const financialInstitutions = {
  getAll: 'financial-institutions',
} as const;

/**
 * Agent Branches endpoints
 */
export const agentBranches = {
  getAll: 'agent-branches',
  create: 'agent-branches',
  getById: {
    definition: 'agent-branches/{Id}',
    render: (id: string): string => 'agent-branches/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },
  update: {
    definition: 'agent-branches/{Id}',
    render: (id: string): string => 'agent-branches/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },
  delete: {
    definition: 'agent-branches/{Id}',
    render: (id: string): string => 'agent-branches/{Id}'.replace('{Id}', encodeURIComponent(id)),
  },
} as const;

/**
 * Files endpoints
 */
export const files = {
  uploadPublicFile: 'files/public',
} as const;

/**
 * Languages endpoints
 */
export const languages = {
  getAll: 'languages',
} as const;

/**
 * Templates endpoints
 */
export const templates = {
  getDefinitions: 'templates/definitions',
  getAll: 'templates',
  getByKey: {
    definition: 'templates/{Key}',
    render: (key: string): string => 'templates/{Key}'.replace('{Key}', encodeURIComponent(key)),
  },
  update: {
    definition: 'templates/{Key}',
    render: (key: string): string => 'templates/{Key}'.replace('{Key}', encodeURIComponent(key)),
  },
  delete: {
    definition: 'templates/{Key}',
    render: (key: string): string => 'templates/{Key}'.replace('{Key}', encodeURIComponent(key)),
  },
} as const;

/**
 * B2C Configuration endpoints
 */
export const b2c = {
  configFields: {
    getAll: 'b2c/config/fields',
    updateAll: 'b2c/config/fields',
  },
} as const;

/**
 * Main endpoints export object
 */
export const endpoints = {
  customers,
  vehicles,
  vehicleParameters,
  insuranceServices,
  agents,
  insuranceCompanies,
  products,
  resourceKeys,
  releaseNotes,
  banks,
  financialInstitutions,
  policies,
  policyTransfers,
  filePolicyTransfers,
  cases,
  coverageGroups,
  webhooks,
  plugins,
  agentBranches,
  files,
  languages,
  templates,
  b2c,
  proposals,
} as const;
