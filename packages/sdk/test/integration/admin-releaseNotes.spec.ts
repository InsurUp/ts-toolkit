import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest, validationError } from './setup';
import { sampleCreateReleaseNoteRequest } from './fixtures/admin-releaseNotes';

const t = setupIntegrationTest();

describe('AdminReleaseNotesClient', () => {
  it('create POSTs the note', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/release-notes`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.releaseNotes.create(sampleCreateReleaseNoteRequest);

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      version: '1.4.0',
      description: 'Admin panel moved to the SDK',
      languageId: 2,
    });
    expect(result.kind).toBe('success');
  });

  it('create maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/release-notes`, () => validationError([], 'Invalid version format'))
    );

    const result = await t.client.admin.releaseNotes.create({
      ...sampleCreateReleaseNoteRequest,
      version: 'v1',
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.detail).toBe('Invalid version format');
    }
  });

  it('update PUTs the note with the version in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/release-notes/:version`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.version).toBe('1.4.0');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.releaseNotes.update('1.4.0', {
      description: 'Admin panel uses the SDK',
      languageId: 1,
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      description: 'Admin panel uses the SDK',
      languageId: 1,
      version: '1.4.0',
    });
    expect(result.kind).toBe('success');
  });

  it('delete DELETEs the version', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/release-notes/:version`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.version).toBe('1.4.0');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.releaseNotes.delete('1.4.0');

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it('delete maps 404 to ResourceNotFound', async () => {
    server.use(http.delete(`${BASE_URL}/release-notes/:version`, () => notFound()));

    const result = await t.client.admin.releaseNotes.delete('9.9.9');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });
});
