import {
  AutoPaymentSetupFailureReason,
  BillingMode,
  EDocumentType,
  InsuranceSyncState,
  InvoiceBuyerDetail,
  InvoiceStatus,
  Module,
  PaymentStatus,
  PaymentType,
  ProductBranch,
  RobotMode,
  SubscriptionActivityAction,
  SubscriptionStatus,
} from '@insurup/contracts';
import type {
  GetAgentBillingActivitiesResult,
  GetAgentBillingSummaryResult,
  GetAgentPaymentsResult,
  GetAllAgentsResult,
} from '@insurup/contracts';

export const sampleAdminAgentId = '0199a1b2-0000-7000-8000-000000000001';
export const sampleAdminPaymentId = '0199a1b2-0000-7000-8000-0000000000a1';

export const sampleGetAllAgentsResult: GetAllAgentsResult = {
  agents: [
    {
      id: sampleAdminAgentId,
      name: 'Acme Sigorta',
      plateNo: 'T123456-ABCD',
      disabled: false,
      email: 'info@acme.example',
      subscription: {
        subscriptionPlanId: 2,
        dayOfMonth: 15,
        userLimit: 10,
        insuranceCompanyLimit: null,
        modules: [Module.Customer, Module.Proposal],
        features: null,
        supportedBranches: [ProductBranch.Kasko, ProductBranch.Trafik],
      },
      monthlyPrice: 2500,
      taxNumber: '1234567890',
      phoneNumber: { number: '5551234567', countryCode: 90 },
      insuranceSyncState: InsuranceSyncState.Succeed,
      robotMode: RobotMode.None,
    },
  ],
  totalCount: 41,
  page: 3,
  pageSize: 20,
};

export const sampleAgentBillingSummary: GetAgentBillingSummaryResult = {
  hasAgreement: true,
  subscriptionPlanId: 2,
  planName: 'Pro',
  userLimit: 10,
  insuranceCompanyLimit: null,
  dayOfMonth: 15,
  billingMode: BillingMode.Auto,
  monthlyAmount: 2500,
  monthlyCharge: { net: 2500, vatRate: 0.2, vat: 500, gross: 3000 },
  currency: 'TRY',
  monthlyAmountOverride: null,
  planMonthlyAmount: 2500,
  nextBillingDate: '2026-11-15T00:00:00Z',
  graceDeadline: null,
  maskedPan: '****1234',
  status: SubscriptionStatus.Active,
  reactivationAmount: null,
  reactivationCharge: null,
  autoPaymentSetupFailure: {
    paymentId: sampleAdminPaymentId,
    reason: AutoPaymentSetupFailureReason.EmailMissing,
    failedAt: '2026-10-01T09:30:00Z',
    canRetry: true,
  },
};

export const sampleAgentPayments: GetAgentPaymentsResult = {
  items: [
    {
      id: sampleAdminPaymentId,
      type: PaymentType.Recurring,
      amount: 3000,
      netAmount: 2500,
      vatAmount: 500,
      vatRate: 0.2,
      currency: 'TRY',
      status: PaymentStatus.Succeeded,
      createdAt: '2026-10-15T08:00:00Z',
      paidAt: '2026-10-15T08:00:05Z',
      failureReason: null,
      note: null,
      invoiceNumber: null,
      invoiceStatus: InvoiceStatus.CustomerDataMissing,
      invoiceDocumentType: EDocumentType.EArchive,
      invoiceMissingBuyerDetail: InvoiceBuyerDetail.TaxOffice,
      hasInvoicePdf: false,
    },
  ],
  totalCount: 1,
  page: 1,
  pageSize: 20,
};

export const sampleAgentBillingActivities: GetAgentBillingActivitiesResult = {
  items: [
    {
      $type: 'billing-mode-changed',
      action: SubscriptionActivityAction.BillingModeChanged,
      createdAt: '2026-10-10T12:00:00Z',
      createdBy: {
        id: '0199a1b2-0000-7000-8000-0000000000f1',
        name: 'Admin',
        email: 'admin@insurup.example',
        isServiceAccount: false,
        userType: 1,
      },
      fromMode: BillingMode.Manual,
      toMode: BillingMode.Auto,
    },
    {
      $type: 'dunning-notice',
      action: SubscriptionActivityAction.PastDueNoticeSkipped,
      createdAt: '2026-10-09T12:00:00Z',
      createdBy: {
        id: '0199a1b2-0000-7000-8000-0000000000f2',
        name: 'System',
        email: null,
        isServiceAccount: true,
        userType: 0,
      },
      recipient: null,
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 20,
};
