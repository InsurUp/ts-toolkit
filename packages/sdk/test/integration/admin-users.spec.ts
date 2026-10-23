import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { AdminPanelUserState } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, problemResponse, setupIntegrationTest, validationError } from './setup';
import {
  sampleAdminPanelUser,
  sampleAdminPanelUserListItem,
  sampleMyAdminPanelUser,
  samplePendingAdminPanelUserListItem,
} from './fixtures/admin-users';

const t = setupIntegrationTest();

const USER_ID = '0192f1a0-0000-7000-8000-000000000001';

describe('InsurUpAdminUsersClient', () => {
  it('getAll GETs /admin-panel-users and returns the parsed list', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/admin-panel-users`, ({ request }) => {
        methodSeen = request.method;
        return HttpResponse.json([
          sampleAdminPanelUserListItem,
          samplePendingAdminPanelUserListItem,
        ]);
      })
    );

    const result = await t.client.admin.users.getAll();

    expect(methodSeen).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.roles).toEqual(['Admin', 'Support']);
      expect(result.data[0]?.state).toBe(AdminPanelUserState.Active);
      expect(result.data[1]?.state).toBe('PENDING');
      expect(result.data[1]?.authUserId).toBeNull();
    }
  });

  it('getById embeds the id in the path and returns the user', async () => {
    let idSeen: unknown;
    server.use(
      http.get(`${BASE_URL}/admin-panel-users/:id`, ({ params }) => {
        idSeen = params.id;
        return HttpResponse.json(sampleAdminPanelUser);
      })
    );

    const result = await t.client.admin.users.getById(USER_ID);

    expect(idSeen).toBe(USER_ID);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.email).toBe('ayse@insurup.com');
      expect(result.data.state).toBe(AdminPanelUserState.Active);
    }
  });

  it('getById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/admin-panel-users/:id`, () => notFound()));

    const result = await t.client.admin.users.getById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('getMe GETs /admin-panel-users/me', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/admin-panel-users/me`, ({ request }) => {
        methodSeen = request.method;
        return HttpResponse.json(sampleMyAdminPanelUser);
      })
    );

    const result = await t.client.admin.users.getMe();

    expect(methodSeen).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.firstName).toBe('Ayşe');
      expect(result.data.authUserId).toBeNull();
    }
  });

  it('updateMe PUTs the profile to /admin-panel-users/me', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/admin-panel-users/me`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.updateMe({
      email: 'ayse@insurup.com',
      firstName: 'Ayşe',
      lastName: 'Kaya',
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      email: 'ayse@insurup.com',
      firstName: 'Ayşe',
      lastName: 'Kaya',
    });
    expect(result.kind).toBe('success');
  });

  it('updateMyPassword POSTs both passwords to /admin-panel-users/me/password', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/me/password`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.updateMyPassword({
      currentPassword: 'old-password',
      newPassword: 'new-password-1',
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      currentPassword: 'old-password',
      newPassword: 'new-password-1',
    });
    expect(result.kind).toBe('success');
  });

  it('invite POSTs the invitation and returns the new user id', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({ id: USER_ID });
      })
    );

    const result = await t.client.admin.users.invite({
      email: 'new@insurup.com',
      firstName: 'Can',
      lastName: 'Öz',
      roles: ['Support'],
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      email: 'new@insurup.com',
      firstName: 'Can',
      lastName: 'Öz',
      roles: ['Support'],
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(USER_ID);
    }
  });

  it('invite maps an existing member to BusinessValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/admin-panel-users`, () =>
        problemResponse({
          status: 422,
          type: 'https://api.insurup.com/problems/business-validation',
          title: 'Unprocessable Entity',
          detail: 'Already a member of the admin panel',
        })
      )
    );

    const result = await t.client.admin.users.invite({
      email: 'ayse@insurup.com',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      roles: [],
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(422);
      expect(result.type).toBe(InsurUpServerErrorType.BusinessValidation);
    }
  });

  it('update PUTs to the id path and repeats the id in the body', async () => {
    let methodSeen: string | undefined;
    let idSeen: unknown;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/admin-panel-users/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        idSeen = params.id;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.update(USER_ID, {
      email: 'ayse@insurup.com',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      roles: ['Admin'],
    });

    expect(methodSeen).toBe('PUT');
    expect(idSeen).toBe(USER_ID);
    expect(receivedBody).toEqual({
      id: USER_ID,
      email: 'ayse@insurup.com',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      roles: ['Admin'],
    });
    expect(result.kind).toBe('success');
  });

  it('delete sends DELETE to the id path', async () => {
    let methodSeen: string | undefined;
    let idSeen: unknown;
    server.use(
      http.delete(`${BASE_URL}/admin-panel-users/:id`, ({ request, params }) => {
        methodSeen = request.method;
        idSeen = params.id;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.delete(USER_ID);

    expect(methodSeen).toBe('DELETE');
    expect(idSeen).toBe(USER_ID);
    expect(result.kind).toBe('success');
  });

  it('deactivate POSTs { userId } to the deactivate path', async () => {
    let idSeen: unknown;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/:userId/deactivate`, async ({ request, params }) => {
        idSeen = params.userId;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.deactivate(USER_ID);

    expect(idSeen).toBe(USER_ID);
    expect(receivedBody).toEqual({ userId: USER_ID });
    expect(result.kind).toBe('success');
  });

  it('reSendInvite POSTs { adminPanelUserId } to the re-send-invite path', async () => {
    let idSeen: unknown;
    let receivedBody: unknown;
    server.use(
      http.post(
        `${BASE_URL}/admin-panel-users/:adminPanelUserId/re-send-invite`,
        async ({ request, params }) => {
          idSeen = params.adminPanelUserId;
          receivedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.users.reSendInvite(USER_ID);

    expect(idSeen).toBe(USER_ID);
    expect(receivedBody).toEqual({ adminPanelUserId: USER_ID });
    expect(result.kind).toBe('success');
  });

  it('migrate POSTs { userId } to the migrate path', async () => {
    let idSeen: unknown;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/:userId/migrate`, async ({ request, params }) => {
        idSeen = params.userId;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.migrate(USER_ID);

    expect(idSeen).toBe(USER_ID);
    expect(receivedBody).toEqual({ userId: USER_ID });
    expect(result.kind).toBe('success');
  });

  it('forgotPassword POSTs the e-mail and accepts an empty 200', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/forgot-password`, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await t.client.admin.users.forgotPassword({ email: 'ayse@insurup.com' });

    expect(receivedBody).toEqual({ email: 'ayse@insurup.com' });
    expect(result.kind).toBe('success');
  });

  it('resetPassword POSTs the code and the new password', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/reset-password`, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.users.resetPassword({
      code: 'RESET-CODE',
      password: 'new-password-1',
    });

    expect(receivedBody).toEqual({ code: 'RESET-CODE', password: 'new-password-1' });
    expect(result.kind).toBe('success');
  });

  it('checkForgotPasswordToken POSTs the code', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(
        `${BASE_URL}/admin-panel-users/check-forgot-password-token`,
        async ({ request }) => {
          receivedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.users.checkForgotPasswordToken({ code: 'RESET-CODE' });

    expect(receivedBody).toEqual({ code: 'RESET-CODE' });
    expect(result.kind).toBe('success');
  });

  it('checkForgotPasswordToken maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/admin-panel-users/check-forgot-password-token`, () =>
        validationError([{ propertyName: 'code', errorMessage: 'Code is required' }])
      )
    );

    const result = await t.client.admin.users.checkForgotPasswordToken({ code: '' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.validationErrors[0]?.propertyName).toBe('code');
    }
  });
});
