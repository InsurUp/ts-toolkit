import type { MigrateLegacyAgentUsersResult } from '@insurup/contracts';

export const sampleMigrateLegacyAgentUsersResult: MigrateLegacyAgentUsersResult = {
  createdCount: 3,
  linkedCount: 2,
  skippedUserIds: ['0192f1a0-0000-7000-8000-0000000000d1'],
  failedUserIds: [],
};
