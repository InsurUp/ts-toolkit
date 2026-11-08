import type {
  InsurGatewayPlatformInsuranceCompany,
  InsurGatewayPlatformProduct,
} from '@insurup/contracts';

export const sampleInsurGatewayPlatformProducts: InsurGatewayPlatformProduct[] = [
  {
    product: 'turkiye-sigorta-kasko-proposal',
    major: 2,
    company: 'turkiye-sigorta',
    operation: 'kasko-proposal',
    productId: 100001,
    mappedMajor: 1,
  },
  {
    product: 'turkiye-sigorta-togg-kasko-proposal',
    major: 1,
    company: 'turkiye-sigorta',
    operation: 'kasko-proposal',
    productId: null,
    mappedMajor: null,
  },
];

export const sampleInsurGatewayPlatformInsuranceCompanies: InsurGatewayPlatformInsuranceCompany[] =
  [
    {
      insuranceCompanyId: 116,
      company: 'turkiye-sigorta',
      connectionFields: { 'Servis URL': 'serviceUrl', 'Kullanıcı Adı': 'username' },
      robotLogin: {},
    },
  ];
