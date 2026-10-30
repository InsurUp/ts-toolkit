import {
  InsuranceProductType,
  ProductBranch,
  type InsurGatewayInsuranceCompany,
  type InsurGatewayProduct,
} from '@insurup/contracts';

export const sampleInsurGatewayProducts: InsurGatewayProduct[] = [
  {
    insurGatewayProductId: 2471,
    name: 'Şeker Trafik Air',
    insurGatewayCompanyId: 49,
    productBranch: ProductBranch.Trafik,
    code: null,
    type: InsuranceProductType.Robot,
    productId: 2471,
    insuranceCompanyId: 49,
  },
  {
    insurGatewayProductId: 3001,
    name: 'Yeni Kasko',
    insurGatewayCompanyId: 49,
    productBranch: ProductBranch.Kasko,
    code: 'YK-1',
    type: InsuranceProductType.WebService,
    productId: null,
    insuranceCompanyId: 49,
  },
];

export const sampleInsurGatewayInsuranceCompanies: InsurGatewayInsuranceCompany[] = [
  { insurGatewayCompanyId: 49, name: 'Şeker Sigorta', insuranceCompanyId: 49 },
  { insurGatewayCompanyId: 120, name: 'Yeni Sigorta', insuranceCompanyId: null },
];
