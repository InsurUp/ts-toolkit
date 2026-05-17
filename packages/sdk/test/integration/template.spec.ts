import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { sampleTemplate } from './fixtures/template';

const t = setupIntegrationTest();

describe('TemplateClient', () => {
  it('getTemplateDefinitions returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/templates/definitions`, () =>
        HttpResponse.json([
          { key: sampleTemplate.key, schema: '{}' },
          { key: 'POLICY_PDF', schema: '{}' },
        ])
      )
    );

    const result = await t.client.templates.getTemplateDefinitions();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.key).toBe(sampleTemplate.key);
    }
  });

  it('getAllTemplates returns parsed array', async () => {
    server.use(http.get(`${BASE_URL}/templates`, () => HttpResponse.json([sampleTemplate])));

    const result = await t.client.templates.getAllTemplates();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.name).toBe(sampleTemplate.name);
    }
  });

  it('getTemplateByKey forwards key in path and languageId in query', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/templates/:key`, ({ request, params }) => {
        capturedUrl = request.url;
        expect(params.key).toBe(sampleTemplate.key);
        return HttpResponse.json(sampleTemplate);
      })
    );

    const result = await t.client.templates.getTemplateByKey(sampleTemplate.key, 2);

    expect(capturedUrl).toContain('languageId=2');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.content).toBe(sampleTemplate.content);
    }
  });

  it('updateTemplate sends PUT with updated fields', async () => {
    let methodSeen: string | undefined;
    let receivedBody: { content?: string; languageId?: number } | undefined;
    server.use(
      http.put(`${BASE_URL}/templates/:key`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.key).toBe('WELCOME_EMAIL');
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.templates.updateTemplate({
      key: 'WELCOME_EMAIL',
      languageId: 1,
      content: 'New content',
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody?.content).toBe('New content');
    expect(receivedBody?.languageId).toBe(1);
  });

  it('deleteTemplate sends DELETE with languageId in query', async () => {
    let capturedUrl: string | undefined;
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/templates/:key`, ({ request, params }) => {
        methodSeen = request.method;
        capturedUrl = request.url;
        expect(params.key).toBe('WELCOME_EMAIL');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.templates.deleteTemplate({ key: 'WELCOME_EMAIL', languageId: 3 });

    expect(methodSeen).toBe('DELETE');
    expect(capturedUrl).toContain('languageId=3');
  });
});
