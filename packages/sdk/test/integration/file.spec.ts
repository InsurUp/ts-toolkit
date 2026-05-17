import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { sampleFileUpload } from './fixtures/file';

const t = setupIntegrationTest();

describe('FileClient', () => {
  it('uploadPublicFile sends multipart form with file and path', async () => {
    let receivedContentType: string | null = null;
    let receivedFileName: string | undefined;
    let receivedPath: string | undefined;

    server.use(
      http.post(`${BASE_URL}/files/upload-public`, async ({ request }) => {
        receivedContentType = request.headers.get('content-type');
        const form = await request.formData();
        const file = form.get('file');
        if (file instanceof File) receivedFileName = file.name;
        const path = form.get('path');
        receivedPath = typeof path === 'string' ? path : undefined;
        return HttpResponse.json(sampleFileUpload);
      })
    );

    const file = new File(['hello world'], 'sample.txt', { type: 'text/plain' });
    const result = await t.client.files.uploadPublicFile({ path: 'docs/abc' }, file, 'sample.txt');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.url).toBe(sampleFileUpload.url);
    }
    expect(receivedContentType).toMatch(/^multipart\/form-data/);
    expect(receivedFileName).toBe('sample.txt');
    expect(receivedPath).toBe('docs/abc');
  });

  it('uploadPublicFile omits path when not provided', async () => {
    let receivedPath: FormDataEntryValue | null = null;
    server.use(
      http.post(`${BASE_URL}/files/upload-public`, async ({ request }) => {
        const form = await request.formData();
        receivedPath = form.get('path');
        return HttpResponse.json({ url: 'x' });
      })
    );

    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    await t.client.files.uploadPublicFile({}, file, 'x.txt');

    expect(receivedPath).toBeNull();
  });
});
