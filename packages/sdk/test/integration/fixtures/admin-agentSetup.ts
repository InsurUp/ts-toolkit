import { AgentSetupRequestState } from '@insurup/contracts';
import type {
  CreateAgentSetupRequestResult,
  GetAgentSetupRequestByIdResult,
  GetAllAgentSetupRequestsResult,
} from '@insurup/contracts';

export const sampleAgentSetupRequestId = '0199a1b2-0000-7000-8000-0000000000c1';

export const sampleCreateAgentSetupRequestResult: CreateAgentSetupRequestResult = {
  id: sampleAgentSetupRequestId,
  code: 'AbC+12/x',
  urlEncodedCode: 'AbC%2B12%2Fx',
  url: 'https://app.insurup.example/agent-setup?code=AbC%2B12%2Fx',
};

export const sampleAgentSetupRequest: GetAgentSetupRequestByIdResult = {
  id: sampleAgentSetupRequestId,
  label: 'Acme onboarding',
  state: AgentSetupRequestState.Active,
  creationDate: '2026-10-20T10:00:00Z',
  expirationTime: '2026-10-27T10:00:00Z',
};

export const sampleAgentSetupRequests: GetAllAgentSetupRequestsResult = {
  items: [
    {
      id: sampleAgentSetupRequestId,
      label: 'Acme onboarding',
      state: AgentSetupRequestState.Done,
      expirationTimeSpan: '7.00:00:00',
      creationDate: '2026-10-20T10:00:00Z',
      createdAgentId: '0199a1b2-0000-7000-8000-000000000001',
      createdAgentUserId: '0199a1b2-0000-7000-8000-0000000000d1',
      expirationTime: '2026-10-27T10:00:00Z',
      isExpired: false,
      createdByAdminPanelUserId: '0199a1b2-0000-7000-8000-0000000000f1',
      code: 'AbC+12/x',
      email: 'owner@acme.example',
      subscriptionPlanId: 2,
      userLimit: null,
      insuranceCompanyLimit: 3,
      setupUrl: 'https://app.insurup.example/agent-setup?code=AbC%2B12%2Fx',
    },
  ],
  totalCount: 11,
  page: 2,
  pageSize: 10,
  totalPages: 2,
  hasNextPage: false,
  hasPreviousPage: true,
};
