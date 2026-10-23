import { Feature, Module, ProductBranch } from '@insurup/contracts';
import type { SubscriptionPlan, UpdateSubscriptionPlanRequest } from '@insurup/contracts';

export const sampleSubscriptionPlan: SubscriptionPlan = {
  id: 2,
  name: 'Pro',
  nameResourceKey: 'subscription-plans.pro.name',
  description: 'For growing agencies',
  descriptionResourceKey: 'subscription-plans.pro.description',
  userLimit: 10,
  insuranceCompanyLimit: null,
  proposalLimit: null,
  purchaseProposalLimit: 500,
  basePrice: 1000,
  pricePerUser: 100,
  pricePerInsuranceCompany: 50,
  modules: [Module.Customer, Module.Proposal, Module.Policy],
  features: [Feature.B2C, Feature.TableExport],
  supportedBranches: [ProductBranch.Kasko, ProductBranch.Trafik],
};

export const sampleUpdateSubscriptionPlanRequest: UpdateSubscriptionPlanRequest = {
  nameResourceKey: 'subscription-plans.pro.name',
  descriptionResourceKey: null,
  basePrice: 1200,
  pricePerUser: 120,
  pricePerInsuranceCompany: 60,
  modules: [Module.Customer, Module.Proposal],
  features: [Feature.DataMasking],
  supportedBranches: [ProductBranch.Dask],
  userLimit: 25,
  insuranceCompanyLimit: null,
};
