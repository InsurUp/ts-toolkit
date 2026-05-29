import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { OAuthClientType, OAuthGrantType } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleOAuthClient, sampleOAuthClientSummary } from './fixtures/oauthClient';

const t = setupIntegrationTest();

describe('OAuthClientClient', () => {
  it('getOAuthClients returns parsed array of summaries', async () => {
    server.use(
      http.get(`${BASE_URL}/oauth-clients`, () => HttpResponse.json([sampleOAuthClientSummary]))
    );

    const result = await t.client.oauthClients.getOAuthClients();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.clientId).toBe('agent-panel');
      expect(result.data[0]?.clientType).toBe(OAuthClientType.Confidential);
    }
  });

  it('getOAuthClientById embeds id in path and returns detail', async () => {
    server.use(
      http.get(`${BASE_URL}/oauth-clients/:id`, ({ params }) => {
        expect(params.id).toBe('OAC-42');
        return HttpResponse.json({ ...sampleOAuthClient, id: 'OAC-42' });
      })
    );

    const result = await t.client.oauthClients.getOAuthClientById('OAC-42');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('OAC-42');
      expect(result.data.redirectUris).toEqual(['https://agent-panel.insurup.com/signin-oidc']);
      expect(result.data.grantTypes).toContain(OAuthGrantType.AuthorizationCode);
    }
  });

  it('getOAuthClientById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/oauth-clients/:id`, () => notFound()));

    const result = await t.client.oauthClients.getOAuthClientById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('createOAuthClient POSTs request body to /oauth-clients', async () => {
    let methodSeen: string | undefined;
    let receivedBody: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE_URL}/oauth-clients`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'OAC-9', applicationId: 'APP-9', clientId: 'new-client' });
      })
    );

    const result = await t.client.oauthClients.createOAuthClient({
      clientId: 'new-client',
      clientType: OAuthClientType.Confidential,
      grantTypes: [OAuthGrantType.ClientCredentials],
      scopes: ['core-api'],
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody?.clientId).toBe('new-client');
    expect(receivedBody?.clientType).toBe(OAuthClientType.Confidential);
    expect(receivedBody?.grantTypes).toEqual([OAuthGrantType.ClientCredentials]);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('OAC-9');
    }
  });

  it('updateOAuthClient PUTs only the provided fields without clobbering others', async () => {
    let methodSeen: string | undefined;
    let receivedBody: Record<string, unknown> | undefined;
    server.use(
      http.put(`${BASE_URL}/oauth-clients/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('OAC-1');
        receivedBody = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.oauthClients.updateOAuthClient({
      id: 'OAC-1',
      redirectUris: ['https://preview-123.agent-panel.insurup.com/signin-oidc'],
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody?.redirectUris).toEqual([
      'https://preview-123.agent-panel.insurup.com/signin-oidc',
    ]);
    // Omitted fields must not be sent, so the backend leaves them unchanged.
    expect(receivedBody).not.toHaveProperty('scopes');
    expect(receivedBody).not.toHaveProperty('displayName');
    expect(result.kind).toBe('success');
  });

  it('deleteOAuthClient sends DELETE to id-specific path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/oauth-clients/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('OAC-99');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.oauthClients.deleteOAuthClient('OAC-99');

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
