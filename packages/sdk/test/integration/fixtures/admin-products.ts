import {
  PaymentOption,
  ProductProposalConditionOperator,
  type ProductInstallmentOption,
  type ProductProposalCondition,
} from '@insurup/contracts';

export const sampleInstallmentOption: ProductInstallmentOption = {
  productId: 42,
  installmentNumber: 6,
  paymentType: PaymentOption.Async3dSecure,
};

export const sampleProposalConditions: ProductProposalCondition[] = [
  { key: 101, operator: ProductProposalConditionOperator.Equals, value: 'E' },
  { key: 202, operator: ProductProposalConditionOperator.NotEquals, value: null },
];
