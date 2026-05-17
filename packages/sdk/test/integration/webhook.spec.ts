import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { sampleWebhook, sampleWebhookDelivery } from './fixtures/webhook';

const t = setupIntegrationTest();

describe('WebhookClient', () => {
  it('createWebhook POSTs full payload and returns id', async () => {
    let receivedBody: { url?: string; events?: unknown[]; secret?: string | null } | undefined;
    server.use(
      http.post(`${BASE_URL}/webhooks`, async ({ request }) => {
        receivedBody = (await request.json()) as typeof receivedBody;
        return HttpResponse.json({ id: 'WH-NEW' });
      })
    );

    const result = await t.client.webhooks.createWebhook({
      url: 'https://example.com/hook',
      events: [],
      secret: 'sk_test_123',
    });

    expect(receivedBody?.url).toBe('https://example.com/hook');
    expect(receivedBody?.secret).toBe('sk_test_123');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('WH-NEW');
    }
  });

  it('getWebhookById embeds id and returns parsed webhook', async () => {
    server.use(
      http.get(`${BASE_URL}/webhooks/:id`, ({ params }) => {
        expect(params.id).toBe(sampleWebhook.id);
        return HttpResponse.json(sampleWebhook);
      })
    );

    const result = await t.client.webhooks.getWebhookById(sampleWebhook.id);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleWebhook.id);
    }
  });

  it('getWebhooks returns parsed list', async () => {
    server.use(
      http.get(`${BASE_URL}/webhooks`, () => HttpResponse.json([{ id: 'WH-1' }, { id: 'WH-2' }]))
    );

    const result = await t.client.webhooks.getWebhooks();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
    }
  });

  it('updateWebhook PUTs to id-specific path with new url', async () => {
    let receivedBody: { url?: string } | undefined;
    let methodSeen: string | undefined;
    server.use(
      http.put(`${BASE_URL}/webhooks/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('WH-1');
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.webhooks.updateWebhook({
      id: 'WH-1',
      url: 'https://new.example.com/hook',
      events: [],
      secret: null,
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody?.url).toBe('https://new.example.com/hook');
  });

  it('deleteWebhook sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/webhooks/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('WH-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.webhooks.deleteWebhook('WH-1');

    expect(methodSeen).toBe('DELETE');
  });

  it('getWebhookDelivery embeds both ids in path', async () => {
    server.use(
      http.get(`${BASE_URL}/webhooks/:wid/deliveries/:did`, ({ params }) => {
        expect(params.wid).toBe('WH-1');
        expect(params.did).toBe(sampleWebhookDelivery.id);
        return HttpResponse.json(sampleWebhookDelivery);
      })
    );

    const result = await t.client.webhooks.getWebhookDelivery('WH-1', sampleWebhookDelivery.id);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleWebhookDelivery.id);
    }
  });

  it('redeliverWebhookEvent POSTs to redeliver path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/webhooks/:wid/deliveries/:did/redeliver`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.wid).toBe('WH-1');
        expect(params.did).toBe('DLV-77');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.webhooks.redeliverWebhookEvent('WH-1', 'DLV-77');

    expect(methodSeen).toBe('POST');
  });
});
