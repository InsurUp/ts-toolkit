/**
 * @fileoverview InsurUp API Endpoints - API endpoint definitions
 * @description API endpoint definitions with identical names and render functions
 */

import type {
  ConsentType,
  ListErrorGroupsQuery,
  ListInvestigationsQuery,
  ListMessageQueuesQuery,
  ListParkedQueuesQuery,
  VehicleUtilizationStyle,
} from '@insurup/contracts';
import { VehicleUtilizationStyleOrdinal } from '@insurup/contracts';
import { withQuery } from './query.js';

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
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/premiums/{InstallmentNumber}',
    render: (proposalId: string, proposalProductId: string, installmentNumber: number): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/premiums/{InstallmentNumber}'
        .replace('{ProposalId}', encodeURIComponent(proposalId))
        .replace('{ProposalProductId}', encodeURIComponent(proposalProductId))
        .replace('{InstallmentNumber}', encodeURIComponent(installmentNumber.toString())),
  },

  addManualProduct: {
    definition: 'proposals/{ProposalId}/products/manual',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/products/manual'.replace(
        '{ProposalId}',
        encodeURIComponent(proposalId)
      ),
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
    definition: 'proposals/{ProposalId}/products/{ProposalProductId}/information-form-document',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/information-form-document'
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
    definition:
      'proposals/{ProposalId}/products/{ProposalProductId}/information-form-document/send',
    render: (proposalId: string, proposalProductId: string): string =>
      'proposals/{ProposalId}/products/{ProposalProductId}/information-form-document/send'
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
    definition: 'proposals/{ProposalId}/products/customer-document-pdf',
    render: (proposalId: string): string =>
      'proposals/{ProposalId}/products/customer-document-pdf'.replace(
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
    render: (policyId: string, version?: number): string => {
      const base = 'policies/{PolicyId}'.replace('{PolicyId}', encodeURIComponent(policyId));
      return version !== undefined
        ? base + '?version=' + encodeURIComponent(version.toString())
        : base;
    },
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
  searchPolicyForClaim: {
    definition: 'policies/search-for-claim',
  },

  claimPolicy: {
    definition: 'policies/{PolicyId}/claim',
    render: (policyId: string): string =>
      'policies/{PolicyId}/claim'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  addPolicyEndorsement: {
    definition: 'policies/{PolicyId}/endorsements',
    render: (policyId: string): string =>
      'policies/{PolicyId}/endorsements'.replace('{PolicyId}', encodeURIComponent(policyId)),
  },

  getPolicyCountAndPremiumAnalytics: {
    definition: 'policies/count-and-premium-analytics',
  },

  getPolicyRenewalAnalytics: {
    definition: 'policies/renewal-analytics',
  },

  getPolicyDistributionByBranch: {
    definition: 'policies/distribution-by-branch-analytics',
  },

  getRepresentativeEarningsAnalytics: {
    definition: 'policies/representative-earnings-analytics',
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
 * Endpoints about the signed-in person rather than an agency they act in
 */
export const me = {
  getMyContexts: 'me/contexts',
  getMyAgents: 'me/agents',
  getMyInvites: 'me/invites',

  acceptInvite: {
    definition: 'me/invites/{InviteId}/accept',
    render: (inviteId: string): string =>
      'me/invites/{InviteId}/accept'.replace('{InviteId}', encodeURIComponent(inviteId)),
  },

  declineInvite: {
    definition: 'me/invites/{InviteId}/decline',
    render: (inviteId: string): string =>
      'me/invites/{InviteId}/decline'.replace('{InviteId}', encodeURIComponent(inviteId)),
  },

  leaveAgent: {
    definition: 'me/agents/{AgentId}/leave',
    render: (agentId: string): string =>
      'me/agents/{AgentId}/leave'.replace('{AgentId}', encodeURIComponent(agentId)),
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

  delete: {
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
    render: (pluginId: string, options?: { limit?: number; hook?: string }): string => {
      const base = 'plugins/{PluginId}/logs'.replace('{PluginId}', encodeURIComponent(pluginId));
      const query: string[] = [];
      if (options?.limit !== undefined) {
        query.push('limit=' + encodeURIComponent(options.limit.toString()));
      }
      if (options?.hook !== undefined) {
        query.push('hook=' + encodeURIComponent(options.hook));
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
 * Paging query parameters of the admin list endpoints (1-based page)
 */
interface AdminPagingQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Admin panel endpoints, grouped like the `admin.*` sub-clients
 */
export const admin = {
  users: {
    getAll: 'admin-panel-users',
    invite: 'admin-panel-users',
    me: 'admin-panel-users/me',
    updateMyPassword: 'admin-panel-users/me/password',
    forgotPassword: 'admin-panel-users/forgot-password',
    resetPassword: 'admin-panel-users/reset-password',
    checkForgotPasswordToken: 'admin-panel-users/check-forgot-password-token',
    byId: {
      definition: 'admin-panel-users/{Id}',
      render: (id: string): string =>
        'admin-panel-users/{Id}'.replace('{Id}', encodeURIComponent(id)),
    },
    deactivate: {
      definition: 'admin-panel-users/{UserId}/deactivate',
      render: (userId: string): string =>
        'admin-panel-users/{UserId}/deactivate'.replace('{UserId}', encodeURIComponent(userId)),
    },
    reSendInvite: {
      definition: 'admin-panel-users/{AdminPanelUserId}/re-send-invite',
      render: (adminPanelUserId: string): string =>
        'admin-panel-users/{AdminPanelUserId}/re-send-invite'.replace(
          '{AdminPanelUserId}',
          encodeURIComponent(adminPanelUserId)
        ),
    },
    migrate: {
      definition: 'admin-panel-users/{UserId}/migrate',
      render: (userId: string): string =>
        'admin-panel-users/{UserId}/migrate'.replace('{UserId}', encodeURIComponent(userId)),
    },
  },

  roles: {
    getAll: 'admin-panel-roles',
    create: 'admin-panel-roles',
    byId: {
      definition: 'admin-panel-roles/{Id}',
      render: (id: string): string =>
        'admin-panel-roles/{Id}'.replace('{Id}', encodeURIComponent(id)),
    },
  },

  invites: {
    getMine: 'me/admin-panel/invites',
    leave: 'me/admin-panel/leave',
    accept: {
      definition: 'me/admin-panel/invites/{InviteId}/accept',
      render: (inviteId: string): string =>
        'me/admin-panel/invites/{InviteId}/accept'.replace(
          '{InviteId}',
          encodeURIComponent(inviteId)
        ),
    },
    decline: {
      definition: 'me/admin-panel/invites/{InviteId}/decline',
      render: (inviteId: string): string =>
        'me/admin-panel/invites/{InviteId}/decline'.replace(
          '{InviteId}',
          encodeURIComponent(inviteId)
        ),
    },
  },

  agents: {
    getAll: {
      definition: 'agents',
      render: (query?: AdminPagingQuery): string =>
        withQuery('agents', { page: query?.page, pageSize: query?.pageSize }),
    },
    activate: {
      definition: 'agents/{AgentId}/activate',
      render: (agentId: string): string =>
        'agents/{AgentId}/activate'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    disable: {
      definition: 'agents/{AgentId}/disable',
      render: (agentId: string): string =>
        'agents/{AgentId}/disable'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    updateSubscription: {
      definition: 'agents/{AgentId}/update-subscription',
      render: (agentId: string): string =>
        'agents/{AgentId}/update-subscription'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    getBillingSummary: {
      definition: 'agents/{AgentId}/billing',
      render: (agentId: string): string =>
        'agents/{AgentId}/billing'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    getPayments: {
      definition: 'agents/{AgentId}/billing/payments',
      render: (agentId: string, query?: AdminPagingQuery): string =>
        withQuery(
          'agents/{AgentId}/billing/payments'.replace('{AgentId}', encodeURIComponent(agentId)),
          { page: query?.page, pageSize: query?.pageSize }
        ),
    },
    getBillingActivities: {
      definition: 'agents/{AgentId}/billing/activities',
      render: (agentId: string, query?: AdminPagingQuery): string =>
        withQuery(
          'agents/{AgentId}/billing/activities'.replace('{AgentId}', encodeURIComponent(agentId)),
          { page: query?.page, pageSize: query?.pageSize }
        ),
    },
    recordManualPayment: {
      definition: 'agents/{AgentId}/billing/manual-payment',
      render: (agentId: string): string =>
        'agents/{AgentId}/billing/manual-payment'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    setBillingMode: {
      definition: 'agents/{AgentId}/billing/mode',
      render: (agentId: string): string =>
        'agents/{AgentId}/billing/mode'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    setPriceOverride: {
      definition: 'agents/{AgentId}/billing/price-override',
      render: (agentId: string): string =>
        'agents/{AgentId}/billing/price-override'.replace('{AgentId}', encodeURIComponent(agentId)),
    },
    issuePaymentInvoice: {
      definition: 'agents/{AgentId}/billing/payments/{PaymentId}/invoice/issue',
      render: (agentId: string, paymentId: string): string =>
        'agents/{AgentId}/billing/payments/{PaymentId}/invoice/issue'
          .replace('{AgentId}', encodeURIComponent(agentId))
          .replace('{PaymentId}', encodeURIComponent(paymentId)),
    },
    attachPaymentManualInvoice: {
      definition: 'agents/{AgentId}/billing/payments/{PaymentId}/invoice/manual',
      render: (agentId: string, paymentId: string): string =>
        'agents/{AgentId}/billing/payments/{PaymentId}/invoice/manual'
          .replace('{AgentId}', encodeURIComponent(agentId))
          .replace('{PaymentId}', encodeURIComponent(paymentId)),
    },
    getPaymentInvoicePdf: {
      definition: 'agents/{AgentId}/billing/payments/{PaymentId}/invoice/pdf',
      render: (agentId: string, paymentId: string): string =>
        'agents/{AgentId}/billing/payments/{PaymentId}/invoice/pdf'
          .replace('{AgentId}', encodeURIComponent(agentId))
          .replace('{PaymentId}', encodeURIComponent(paymentId)),
    },
  },

  agentUsers: {
    migrateLegacy: 'agent-users/migrate-legacy',
  },

  subscriptionPlans: {
    getAll: 'subscription-plans',
    create: 'subscription-plans',
    byId: {
      definition: 'subscription-plans/{SubscriptionPlanId}',
      render: (subscriptionPlanId: string | number): string =>
        'subscription-plans/{SubscriptionPlanId}'.replace(
          '{SubscriptionPlanId}',
          encodeURIComponent(String(subscriptionPlanId))
        ),
    },
  },

  agentSetup: {
    getAll: {
      definition: 'agent-setup-requests',
      render: (query?: AdminPagingQuery): string =>
        withQuery('agent-setup-requests', { page: query?.page, pageSize: query?.pageSize }),
    },
  },

  products: {
    sync: 'products/sync',
    enable: {
      definition: 'products/{ProductId}/enable',
      render: (productId: string | number): string =>
        'products/{ProductId}/enable'.replace('{ProductId}', encodeURIComponent(String(productId))),
    },
    disable: {
      definition: 'products/{ProductId}/disable',
      render: (productId: string | number): string =>
        'products/{ProductId}/disable'.replace(
          '{ProductId}',
          encodeURIComponent(String(productId))
        ),
    },
    installmentOptions: {
      definition: 'products/{ProductId}/installment-options',
      render: (productId: string | number): string =>
        'products/{ProductId}/installment-options'.replace(
          '{ProductId}',
          encodeURIComponent(String(productId))
        ),
    },
    installmentOption: {
      definition: 'products/{ProductId}/installment-options/{InstallmentNumber}',
      render: (productId: string | number, installmentNumber: number): string =>
        'products/{ProductId}/installment-options/{InstallmentNumber}'
          .replace('{ProductId}', encodeURIComponent(String(productId)))
          .replace('{InstallmentNumber}', encodeURIComponent(String(installmentNumber))),
    },
    proposalConditions: {
      definition: 'products/{ProductId}/proposal-conditions',
      render: (productId: string | number): string =>
        'products/{ProductId}/proposal-conditions'.replace(
          '{ProductId}',
          encodeURIComponent(String(productId))
        ),
    },
  },

  insuranceCompanies: {
    byId: {
      definition: 'insurance-companies/{Id}',
      render: (id: string | number): string =>
        'insurance-companies/{Id}'.replace('{Id}', encodeURIComponent(String(id))),
    },
    connectionFields: {
      definition: 'insurance-companies/{InsuranceCompanyId}/connection-fields',
      render: (insuranceCompanyId: string | number): string =>
        'insurance-companies/{InsuranceCompanyId}/connection-fields'.replace(
          '{InsuranceCompanyId}',
          encodeURIComponent(String(insuranceCompanyId))
        ),
    },
    connectionField: {
      definition: 'insurance-companies/{InsuranceCompanyId}/connection-fields/{Key}',
      render: (insuranceCompanyId: string | number, key: string): string =>
        'insurance-companies/{InsuranceCompanyId}/connection-fields/{Key}'
          .replace('{InsuranceCompanyId}', encodeURIComponent(String(insuranceCompanyId)))
          .replace('{Key}', encodeURIComponent(key)),
    },
  },

  resourceKeys: {
    create: 'resource-keys',
    createMany: 'resource-keys/bulk',
    byKey: {
      definition: 'resource-keys/{Key}',
      render: (key: string): string =>
        'resource-keys/{Key}'.replace('{Key}', encodeURIComponent(key)),
    },
  },

  releaseNotes: {
    create: 'release-notes',
    byVersion: {
      definition: 'release-notes/{Version}',
      render: (version: string): string =>
        'release-notes/{Version}'.replace('{Version}', encodeURIComponent(version)),
    },
  },

  cache: {
    flush: 'cache/flush',
  },

  observability: {
    getCapabilities: 'observability/capabilities',
    searchLogs: 'observability/logs/search',
    countLogs: 'observability/logs/counts',
    getLogHistogram: 'observability/logs/histogram',
    getLogFieldValues: 'observability/logs/field-values',
    resolveLogCorrelation: 'observability/logs/correlation',
    groupLogs: 'observability/logs/groups',
    queryMetrics: 'observability/metrics/query',
    searchTraces: 'observability/traces/search',
    getTraceOperations: {
      definition: 'observability/traces/operations',
      render: (service: string): string =>
        withQuery('observability/traces/operations', { service }),
    },
    getTrace: {
      definition: 'observability/traces/{TraceId}',
      render: (traceId: string): string =>
        'observability/traces/{TraceId}'.replace('{TraceId}', encodeURIComponent(traceId)),
    },
    getTraceSpan: {
      definition: 'observability/traces/{TraceId}/spans/{SpanId}',
      render: (traceId: string, spanId: string): string =>
        'observability/traces/{TraceId}/spans/{SpanId}'
          .replace('{TraceId}', encodeURIComponent(traceId))
          .replace('{SpanId}', encodeURIComponent(spanId)),
    },
    getIgwIndexStatus: 'observability/igw-calls/index-status',
    getIgwCall: {
      definition: 'observability/igw-calls/{LogId}',
      render: (logId: string): string =>
        'observability/igw-calls/{LogId}'.replace('{LogId}', encodeURIComponent(logId)),
    },
    getSlowQueries: 'observability/database/slow-queries',
    getSlowQuery: 'observability/database/slow-queries/detail',
    getSlowQuerySample: 'observability/database/slow-queries/sample',
    getDatabaseCollections: 'observability/database/collections',
    getDatabaseCollection: {
      definition: 'observability/database/collections/{Database}/{Collection}',
      render: (database: string, collection: string): string =>
        'observability/database/collections/{Database}/{Collection}'
          .replace('{Database}', encodeURIComponent(database))
          .replace('{Collection}', encodeURIComponent(collection)),
    },
  },

  alerts: {
    getAlerts: 'observability/alerts',
    getHistory: 'observability/alerts/history',
    rules: 'observability/alerts/rules',
    previewRule: 'observability/alerts/rules/preview',
    channels: 'observability/alerts/channels',
    createSilence: 'observability/alerts/silences',
    rule: {
      definition: 'observability/alerts/rules/{RuleId}',
      render: (ruleId: string): string =>
        'observability/alerts/rules/{RuleId}'.replace('{RuleId}', encodeURIComponent(ruleId)),
    },
    acknowledge: {
      definition: 'observability/alerts/rules/{RuleId}/acknowledge',
      render: (ruleId: string): string =>
        'observability/alerts/rules/{RuleId}/acknowledge'.replace(
          '{RuleId}',
          encodeURIComponent(ruleId)
        ),
    },
    channel: {
      definition: 'observability/alerts/channels/{ChannelId}',
      render: (channelId: string): string =>
        'observability/alerts/channels/{ChannelId}'.replace(
          '{ChannelId}',
          encodeURIComponent(channelId)
        ),
    },
    testChannel: {
      definition: 'observability/alerts/channels/{ChannelId}/test',
      render: (channelId: string): string =>
        'observability/alerts/channels/{ChannelId}/test'.replace(
          '{ChannelId}',
          encodeURIComponent(channelId)
        ),
    },
    getSilences: {
      definition: 'observability/alerts/silences',
      render: (includeExpired?: boolean): string =>
        withQuery('observability/alerts/silences', { includeExpired }),
    },
    expireSilence: {
      definition: 'observability/alerts/silences/{SilenceId}/expire',
      render: (silenceId: string): string =>
        'observability/alerts/silences/{SilenceId}/expire'.replace(
          '{SilenceId}',
          encodeURIComponent(silenceId)
        ),
    },
  },

  errors: {
    list: {
      definition: 'observability/errors',
      render: (query?: ListErrorGroupsQuery): string => {
        const base = withQuery('observability/errors', {
          service: query?.service,
          search: query?.search,
          cursor: query?.cursor,
          limit: query?.limit,
        });
        const statuses = (query?.status ?? []).map(
          (status) => `status=${encodeURIComponent(status)}`
        );
        if (statuses.length === 0) {
          return base;
        }
        return `${base}${base.includes('?') ? '&' : '?'}${statuses.join('&')}`;
      },
    },
    group: {
      definition: 'observability/errors/{ErrorGroupId}',
      render: (errorGroupId: string): string =>
        'observability/errors/{ErrorGroupId}'.replace(
          '{ErrorGroupId}',
          encodeURIComponent(errorGroupId)
        ),
    },
    investigate: {
      definition: 'observability/errors/{ErrorGroupId}/investigate',
      render: (errorGroupId: string): string =>
        'observability/errors/{ErrorGroupId}/investigate'.replace(
          '{ErrorGroupId}',
          encodeURIComponent(errorGroupId)
        ),
    },
    settings: 'observability/error-tracking/settings',
  },

  investigations: {
    list: {
      definition: 'observability/investigations',
      render: (query?: ListInvestigationsQuery): string =>
        withQuery('observability/investigations', {
          kind: query?.kind,
          ruleId: query?.ruleId,
          notificationId: query?.notificationId,
          errorGroupId: query?.errorGroupId,
          cursor: query?.cursor,
          limit: query?.limit,
        }),
    },
    investigation: {
      definition: 'observability/investigations/{InvestigationId}',
      render: (investigationId: string): string =>
        'observability/investigations/{InvestigationId}'.replace(
          '{InvestigationId}',
          encodeURIComponent(investigationId)
        ),
    },
  },

  messages: {
    queues: {
      definition: 'observability/messages/queues',
      render: (query?: ListMessageQueuesQuery): string =>
        withQuery('observability/messages/queues', {
          kind: query?.kind,
          search: query?.search,
        }),
    },
    peek: {
      definition: 'observability/messages/queues/{Name}/peek',
      render: (name: string): string =>
        'observability/messages/queues/{Name}/peek'.replace('{Name}', encodeURIComponent(name)),
    },
    replay: {
      definition: 'observability/messages/queues/{Name}/replay',
      render: (name: string): string =>
        'observability/messages/queues/{Name}/replay'.replace('{Name}', encodeURIComponent(name)),
    },
    purge: {
      definition: 'observability/messages/queues/{Name}/purge',
      render: (name: string): string =>
        'observability/messages/queues/{Name}/purge'.replace('{Name}', encodeURIComponent(name)),
    },
    parkedList: {
      definition: 'observability/messages/parked',
      render: (query?: ListParkedQueuesQuery): string =>
        withQuery('observability/messages/parked', { state: query?.state }),
    },
    parked: {
      definition: 'observability/messages/parked/{ParkedQueueId}',
      render: (parkedQueueId: string): string =>
        'observability/messages/parked/{ParkedQueueId}'.replace(
          '{ParkedQueueId}',
          encodeURIComponent(parkedQueueId)
        ),
    },
    investigate: {
      definition: 'observability/messages/parked/{ParkedQueueId}/investigate',
      render: (parkedQueueId: string): string =>
        'observability/messages/parked/{ParkedQueueId}/investigate'.replace(
          '{ParkedQueueId}',
          encodeURIComponent(parkedQueueId)
        ),
    },
    settings: 'observability/messages/settings',
  },

  insights: {
    getOverview: 'observability/insights/overview',
    getAgents: 'observability/insights/agents',
    getAgent: 'observability/insights/agent',
    getFeatures: 'observability/insights/features',
    getSales: 'observability/insights/sales',
    getChannels: 'observability/insights/channels',
    getOperations: 'observability/insights/operations',
    getAssistant: 'observability/insights/assistant',
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
  admin,
} as const;
