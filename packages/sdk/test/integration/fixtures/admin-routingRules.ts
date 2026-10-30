import {
  InsuranceOperation,
  InsuranceServiceProvider,
  ProductBranch,
  type CreateRoutingRuleRequest,
  type RoutingRule,
} from '@insurup/contracts';

export const sampleDefaultRule: RoutingRule = {
  id: '0193a3c4-0000-7000-8000-000000000001',
  operation: InsuranceOperation.Proposal,
  insuranceCompanyId: null,
  productBranch: null,
  productId: null,
  agentIds: [],
  provider: InsuranceServiceProvider.InsurGateway,
  executionInsuranceCompanyId: null,
  isDefault: true,
};

export const sampleScopedRule: RoutingRule = {
  id: '0193a3c4-0000-7000-8000-000000000002',
  operation: InsuranceOperation.Proposal,
  insuranceCompanyId: 49,
  productBranch: ProductBranch.Kasko,
  productId: null,
  agentIds: ['0193a3c4-0000-7000-8000-00000000aaaa'],
  provider: InsuranceServiceProvider.InsurGateway,
  executionInsuranceCompanyId: null,
  isDefault: false,
};

export const sampleCreateRoutingRuleRequest: CreateRoutingRuleRequest = {
  operation: InsuranceOperation.Proposal,
  insuranceCompanyId: 49,
  productBranch: ProductBranch.Kasko,
  agentIds: ['0193a3c4-0000-7000-8000-00000000aaaa'],
  provider: InsuranceServiceProvider.InsurGateway,
};
