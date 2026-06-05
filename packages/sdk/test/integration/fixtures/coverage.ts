export const emptyCoverage = { $type: 'empty' as const, productBranch: 'EMPTY' as const };

export const sampleCoverageGroup = {
  id: 'CG-1',
  name: 'Basic',
  description: null,
  createdAt: '2024-01-01T00:00:00Z',
  createdBy: { id: 'U-1', name: 'Agent' },
  productBranch: 'KASKO',
  coverageTable: [{ coverage: emptyCoverage, insuranceCompanyId: null, type: null }],
  isDefault: false,
};
