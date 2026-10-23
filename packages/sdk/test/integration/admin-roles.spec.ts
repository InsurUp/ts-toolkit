import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest, validationError } from './setup';
import { sampleAdminPanelRole, sampleAdminPanelRoleListItem } from './fixtures/admin-roles';

const t = setupIntegrationTest();

const ROLE_ID = '0192f1a0-0000-7000-8000-0000000000b1';

describe('InsurUpAdminRolesClient', () => {
  it('getAll GETs /admin-panel-roles and returns the parsed list', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/admin-panel-roles`, ({ request }) => {
        methodSeen = request.method;
        return HttpResponse.json([sampleAdminPanelRoleListItem]);
      })
    );

    const result = await t.client.admin.roles.getAll();

    expect(methodSeen).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Support');
      expect(result.data[0]?.permissions).toEqual(['users:read', 'agents:read']);
    }
  });

  it('getById embeds the id in the path and returns the role', async () => {
    let idSeen: unknown;
    server.use(
      http.get(`${BASE_URL}/admin-panel-roles/:id`, ({ params }) => {
        idSeen = params.id;
        return HttpResponse.json(sampleAdminPanelRole);
      })
    );

    const result = await t.client.admin.roles.getById(ROLE_ID);

    expect(idSeen).toBe(ROLE_ID);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(ROLE_ID);
    }
  });

  it('getById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/admin-panel-roles/:id`, () => notFound()));

    const result = await t.client.admin.roles.getById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('create POSTs the role to /admin-panel-roles', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-roles`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.roles.create({
      roleName: 'Support',
      permissions: ['users:read'],
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({ roleName: 'Support', permissions: ['users:read'] });
    expect(result.kind).toBe('success');
  });

  it('create sends only the role name when no permissions are given', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/admin-panel-roles`, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.roles.create({ roleName: 'Viewer' });

    expect(receivedBody).toEqual({ roleName: 'Viewer' });
    expect(result.kind).toBe('success');
  });

  it('create maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/admin-panel-roles`, () =>
        validationError([{ propertyName: 'roleName', errorMessage: 'Role name is required' }])
      )
    );

    const result = await t.client.admin.roles.create({ roleName: '' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.validationErrors[0]?.propertyName).toBe('roleName');
    }
  });

  it('update PUTs to the id path and repeats the id in the body', async () => {
    let methodSeen: string | undefined;
    let idSeen: unknown;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/admin-panel-roles/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        idSeen = params.id;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.roles.update(ROLE_ID, {
      name: 'Senior Support',
      permissions: ['users:read', 'users:invite'],
    });

    expect(methodSeen).toBe('PUT');
    expect(idSeen).toBe(ROLE_ID);
    expect(receivedBody).toEqual({
      id: ROLE_ID,
      name: 'Senior Support',
      permissions: ['users:read', 'users:invite'],
    });
    expect(result.kind).toBe('success');
  });

  it('delete sends DELETE to the id path', async () => {
    let methodSeen: string | undefined;
    let idSeen: unknown;
    server.use(
      http.delete(`${BASE_URL}/admin-panel-roles/:id`, ({ request, params }) => {
        methodSeen = request.method;
        idSeen = params.id;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.roles.delete(ROLE_ID);

    expect(methodSeen).toBe('DELETE');
    expect(idSeen).toBe(ROLE_ID);
    expect(result.kind).toBe('success');
  });
});
