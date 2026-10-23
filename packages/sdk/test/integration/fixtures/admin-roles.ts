import type { GetAdminPanelRoleByIdResult, GetAdminPanelRolesResult } from '@insurup/contracts';

export const sampleAdminPanelRoleListItem: GetAdminPanelRolesResult = {
  id: '0192f1a0-0000-7000-8000-0000000000b1',
  name: 'Support',
  permissions: ['users:read', 'agents:read'],
};

export const sampleAdminPanelRole: GetAdminPanelRoleByIdResult = {
  id: '0192f1a0-0000-7000-8000-0000000000b1',
  name: 'Support',
  permissions: ['users:read', 'agents:read'],
};
