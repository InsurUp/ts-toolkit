import {
  AdminPanelUserState,
  type GetAdminPanelUserByIdResult,
  type GetAdminPanelUsersResult,
  type GetMyAdminPanelUserResult,
} from '@insurup/contracts';

export const sampleAdminPanelUserListItem: GetAdminPanelUsersResult = {
  id: '0192f1a0-0000-7000-8000-000000000001',
  firstName: 'Ayşe',
  lastName: 'Yılmaz',
  email: 'ayse@insurup.com',
  roles: ['Admin', 'Support'],
  state: AdminPanelUserState.Active,
  authUserId: '0192f1a0-0000-7000-8000-0000000000a1',
};

export const samplePendingAdminPanelUserListItem: GetAdminPanelUsersResult = {
  id: '0192f1a0-0000-7000-8000-000000000002',
  firstName: 'Mehmet',
  lastName: 'Demir',
  email: 'mehmet@insurup.com',
  roles: ['Support'],
  state: AdminPanelUserState.Pending,
  authUserId: null,
};

export const sampleAdminPanelUser: GetAdminPanelUserByIdResult = {
  id: '0192f1a0-0000-7000-8000-000000000001',
  email: 'ayse@insurup.com',
  roles: ['Admin'],
  state: AdminPanelUserState.Active,
};

export const sampleMyAdminPanelUser: GetMyAdminPanelUserResult = {
  id: '0192f1a0-0000-7000-8000-000000000001',
  firstName: 'Ayşe',
  lastName: 'Yılmaz',
  email: 'ayse@insurup.com',
  roles: ['Admin'],
  authUserId: null,
};
