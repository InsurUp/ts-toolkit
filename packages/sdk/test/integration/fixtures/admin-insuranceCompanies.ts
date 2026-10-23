import {
  InsuranceCompanyConnectionFieldPurpose,
  InsuranceCompanyConnectionFieldValueType,
  PaymentOption,
  ProductBranch,
  type GetCompanyConnectionFieldResult,
  type GetCompanyConnectionFieldsResult,
  type UpdateInsuranceCompanyRequest,
  type CreateCompanyConnectionFieldRequest,
  type UpdateCompanyConnectionFieldRequest,
} from '@insurup/contracts';

export const sampleUpdateInsuranceCompanyRequest: UpdateInsuranceCompanyRequest = {
  name: 'Anadolu Sigorta',
  logo: null,
  enabled: true,
  paymentOptions: [
    {
      branches: null,
      paymentOption: PaymentOption.SyncCreditCard,
      enabled: true,
      disabledDescriptionResourceKey: null,
    },
    {
      branches: [ProductBranch.Kasko],
      paymentOption: PaymentOption.SyncCreditCard,
      enabled: false,
      disabledDescriptionResourceKey: 'PAYMENT_DISABLED_KASKO',
    },
  ],
};

export const sampleConnectionFields: GetCompanyConnectionFieldsResult[] = [
  {
    key: 'username',
    insuranceServicesKey: 'UserName',
    valueType: InsuranceCompanyConnectionFieldValueType.AgentBased,
  },
  {
    key: 'channel',
    insuranceServicesKey: 'Channel',
    valueType: InsuranceCompanyConnectionFieldValueType.Constant,
  },
];

export const sampleConnectionField: GetCompanyConnectionFieldResult = {
  key: 'channel',
  insuranceServicesKey: 'Channel',
  valueType: InsuranceCompanyConnectionFieldValueType.Constant,
  labelResourceKey: 'CONNECTION_FIELD_CHANNEL',
  descriptionResourceKey: null,
  value: 'WEB',
  order: 2,
};

export const sampleCreateConnectionFieldRequest: CreateCompanyConnectionFieldRequest = {
  key: 'username',
  insuranceServicesKey: 'UserName',
  valueType: InsuranceCompanyConnectionFieldValueType.AgentBased,
  purpose: InsuranceCompanyConnectionFieldPurpose.Connection,
  labelResourceKey: 'CONNECTION_FIELD_USERNAME',
  order: 1,
};

export const sampleUpdateConnectionFieldRequest: UpdateCompanyConnectionFieldRequest = {
  insuranceServicesKey: 'Channel',
  valueType: InsuranceCompanyConnectionFieldValueType.Constant,
  purpose: InsuranceCompanyConnectionFieldPurpose.AgentNumber,
  labelResourceKey: 'CONNECTION_FIELD_CHANNEL',
  order: 3,
  descriptionResourceKey: null,
  value: 'MOBILE',
  hidden: true,
};
