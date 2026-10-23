import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest } from './setup';
import { sampleCreateResourceKeyRequests, sampleResourceKey } from './fixtures/admin-resourceKeys';

const t = setupIntegrationTest();

describe('AdminResourceKeysClient', () => {
  it('getByKey GETs the key, encoded into the path', async () => {
    let urlSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/resource-keys/:key`, ({ request }) => {
        urlSeen = request.url;
        return HttpResponse.json(sampleResourceKey);
      })
    );

    const result = await t.client.admin.resourceKeys.getByKey('promo banner/title');

    expect(urlSeen).toBe(`${BASE_URL}/resource-keys/promo%20banner%2Ftitle`);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toEqual(sampleResourceKey);
    }
  });

  it('getByKey maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/resource-keys/:key`, () => notFound()));

    const result = await t.client.admin.resourceKeys.getByKey('MISSING');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('create POSTs one translation', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/resource-keys`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.resourceKeys.create({
      languageId: 1,
      key: 'WELCOME.TITLE',
      description: 'Shown on the dashboard',
      value: 'Hoş geldiniz',
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      languageId: 1,
      key: 'WELCOME.TITLE',
      description: 'Shown on the dashboard',
      value: 'Hoş geldiniz',
    });
    expect(result.kind).toBe('success');
  });

  it('create maps 409 to ResourceDuplicate', async () => {
    server.use(http.post(`${BASE_URL}/resource-keys`, () => conflict()));

    const result = await t.client.admin.resourceKeys.create({
      languageId: 1,
      key: 'WELCOME.TITLE',
      value: 'Hoş geldiniz',
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('createMany POSTs every translation to the bulk route', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/resource-keys/bulk`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.resourceKeys.createMany({
      resourceKeys: sampleCreateResourceKeyRequests,
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      resourceKeys: [
        { languageId: 1, key: 'WELCOME.TITLE', value: 'Hoş geldiniz' },
        { languageId: 2, key: 'WELCOME.TITLE', description: null, value: 'Welcome' },
      ],
    });
    expect(result.kind).toBe('success');
  });

  it('update PUTs the translation with the key in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/resource-keys/:key`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.key).toBe('WELCOME.TITLE');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.resourceKeys.update('WELCOME.TITLE', {
      languageId: 2,
      description: null,
      value: 'Welcome!',
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      languageId: 2,
      description: null,
      value: 'Welcome!',
      key: 'WELCOME.TITLE',
    });
    expect(result.kind).toBe('success');
  });

  it('delete DELETEs the key', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/resource-keys/:key`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.key).toBe('WELCOME.TITLE');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.resourceKeys.delete('WELCOME.TITLE');

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
