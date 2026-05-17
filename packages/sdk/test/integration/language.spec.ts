import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { setupIntegrationTest, upstreamError } from './setup';
import { sampleLanguages } from './fixtures/language';

const t = setupIntegrationTest();

describe('LanguageClient', () => {
  it('getLanguages returns parsed array with all language fields', async () => {
    server.use(http.get(`${BASE_URL}/languages`, () => HttpResponse.json(sampleLanguages)));

    const result = await t.client.languages.getLanguages();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(sampleLanguages.length);
      expect(result.data[0]?.code).toBe(sampleLanguages[0]?.code);
      expect(result.data[0]?.nativeName).toBe(sampleLanguages[0]?.nativeName);
      expect(result.data[1]?.englishName).toBe(sampleLanguages[1]?.englishName);
    }
  });

  it('getLanguages handles empty list', async () => {
    server.use(http.get(`${BASE_URL}/languages`, () => HttpResponse.json([])));

    const result = await t.client.languages.getLanguages();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toEqual([]);
    }
  });

  it('getLanguages maps 500 to server-error', async () => {
    server.use(http.get(`${BASE_URL}/languages`, () => upstreamError()));

    const result = await t.client.languages.getLanguages();

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(500);
      expect(result.type).toBe(InsurUpServerErrorType.Upstream);
    }
  });
});
