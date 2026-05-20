/**
 * @fileoverview Proposal SignalR Hub Event Types
 * @description Payload shapes for server→client methods on the InsurUp
 *   ProposalDetailHub. These mirror the C# DTOs under
 *   InsuranceUp.Modules.ProposalManagement.SignalR.Models so the SDK can
 *   surface strongly-typed real-time proposal product updates.
 */

import type { Currency, InsuranceProductType, PaymentOption } from './common.base.js';
import type { Coverage } from './common.coverage.js';

/**
 * Common fields shared by every proposal-product event except
 * {@link ProposalProductCoverageEvent}.
 */
export interface ProposalProductEventBase {
  readonly proposalId: string;
  readonly proposalProductId: string;
  readonly productId: number;
  readonly productName: string;
  readonly productType: InsuranceProductType;
  readonly insuranceCompanyId: number;
  readonly insuranceCompanyName: string;
  readonly insuranceCompanyLogo?: string;
  readonly supportedPaymentOptions: readonly PaymentOption[];
}

/**
 * One installment plan offered by an insurance company for a proposal product.
 */
export interface ProposalProductPremium {
  readonly installmentNumber: number;
  readonly insurancePremiumReference: string;
  readonly netPremium: number;
  readonly grossPremium: number;
  readonly commission: number;
  readonly exchangeRate: number;
  readonly currency: Currency;
  readonly insuranceCompanyProposalNumber?: string;
}

/** Emitted when a proposal product was priced successfully. */
export interface ProposalProductSuccessEvent extends ProposalProductEventBase {
  readonly needsInvestigationByCompany: boolean;
  readonly investigationMessage?: string;
  readonly hasVocationalDiscount: boolean;
  readonly hasUndamagedDiscount: boolean;
  readonly hasUndamagedDiscountRate?: number;
  readonly premiums: readonly ProposalProductPremium[];
  readonly insuranceServiceProviderCoverage?: Coverage;
  readonly pdfCoverage?: Coverage;
  readonly initialCoverage?: Coverage;
  readonly optimalCoverage?: Coverage;
}

/** Emitted when pricing a proposal product failed. */
export interface ProposalProductFailedEvent extends ProposalProductEventBase {
  readonly errorMessage?: string;
}

/** Emitted when pricing for a proposal product started. */
export type ProposalProductInProgressEvent = ProposalProductEventBase;

/** Emitted when a proposal product's inputs were revised and pricing restarted. */
export type ProposalProductRevisedEvent = ProposalProductEventBase;

/** Emitted when purchase of a proposal product started. */
export type ProposalProductPurchasingEvent = ProposalProductEventBase;

/** Emitted when a proposal product was purchased and turned into a policy. */
export interface ProposalProductPurchasedEvent extends ProposalProductEventBase {
  readonly policyId: string;
}

/** Emitted when purchase of a proposal product failed. */
export interface ProposalProductPurchaseFailedEvent extends ProposalProductEventBase {
  readonly errorMessage?: string;
}

/**
 * Emitted when refined coverage data (e.g. parsed PDF or optimal package)
 * becomes available for a proposal product. Note: this is a leaner shape than
 * {@link ProposalProductEventBase}.
 */
export interface ProposalProductCoverageEvent {
  readonly proposalId: string;
  readonly proposalProductId: string;
  readonly pdfCoverage?: Coverage;
  readonly optimalCoverage?: Coverage;
  readonly hasVocationalDiscount?: boolean;
  readonly hasUndamagedDiscount?: boolean;
  readonly hasUndamagedDiscountRate?: number;
}
