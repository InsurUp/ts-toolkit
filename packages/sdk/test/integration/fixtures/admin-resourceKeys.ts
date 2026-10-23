import type { CreateResourceKeyRequest, ResourceKey } from '@insurup/contracts';

export const sampleResourceKey: ResourceKey = {
  languageId: 1,
  key: 'WELCOME.TITLE',
  description: 'Shown on the dashboard',
  value: 'Hoş geldiniz',
};

export const sampleCreateResourceKeyRequests: CreateResourceKeyRequest[] = [
  { languageId: 1, key: 'WELCOME.TITLE', value: 'Hoş geldiniz' },
  { languageId: 2, key: 'WELCOME.TITLE', description: null, value: 'Welcome' },
];
