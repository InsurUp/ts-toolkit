/**
 * Wire-format regression tests for the customer consent SDK surface.
 *
 * These pin the exact URL, HTTP method, and body that each method sends so the
 * SDK can't silently drift from the deployed OpenAPI schema again — the prior
 * drift sent `{ consentType, consentDate, source }` to give, used a non-existent
 * `POST .../consents/revoke` route, and read `activeConsents`/`consentHistory`
 * from a response whose fields are actually `consents`/`history`.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConsentAction,
  ConsentChannel,
  ConsentType,
  type GetCustomerConsentsResult,
} from '@insurup/contracts';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Customer consent endpoints', () => {
  let client: DefaultInsurUpClient;
  const customerId = 'CUSTOMER-CONSENT-1';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: { retries: 0, minTimeout: 10, maxTimeout: 50, factor: 1.5, randomize: false },
    });
  });

  describe('giveCustomerConsent', () => {
    it('POSTs { consentType, channel, customerId } to customers/{id}/consents', async () => {
      // The deployed API requires `customerId` in the body even though it's
      // already in the path (the OpenAPI spec is incomplete on this). The SDK
      // injects it; this test pins that behavior.
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const result = await client.customers.giveCustomerConsent(customerId, {
        consentType: ConsentType.KVKK,
        channel: ConsentChannel.Web,
      });

      expect(result.kind).toBe('success');
      const [url, init] = mockFetch.mock.calls[0] ?? [];
      expect(url).toBe(`https://test.api.com/api/customers/${customerId}/consents`);
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init?.body as string)).toEqual({
        consentType: 'KVKK',
        channel: 'WEB',
        customerId,
      });
    });
  });

  describe('revokeCustomerConsent', () => {
    it('DELETEs customers/{id}/consents/{consentType} with no body', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const result = await client.customers.revokeCustomerConsent(customerId, ConsentType.KVKK);

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test.api.com/api/customers/${customerId}/consents/KVKK`,
        expect.objectContaining({
          method: 'DELETE',
          body: null,
        })
      );
    });
  });

  describe('getCustomerConsents', () => {
    it('GETs customers/{id}/consents and parses the { consents, history } payload', async () => {
      const payload: GetCustomerConsentsResult = {
        consents: [
          { consentType: ConsentType.KVKK, isActive: true },
          { consentType: ConsentType.ETK, isActive: false },
        ],
        history: [
          {
            consentType: ConsentType.KVKK,
            action: ConsentAction.Given,
            performedAt: '2026-01-15T10:30:00Z',
            performedBy: { id: 'AGENT-1', name: 'Agent Smith' },
            channel: ConsentChannel.Web,
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json(payload));

      const result = await client.customers.getCustomerConsents(customerId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://test.api.com/api/customers/${customerId}/consents`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.consents).toHaveLength(2);
        expect(result.data.consents[0]).toEqual({
          consentType: ConsentType.KVKK,
          isActive: true,
        });
        expect(result.data.history).toHaveLength(1);
        expect(result.data.history[0]?.action).toBe(ConsentAction.Given);
        expect(result.data.history[0]?.performedBy.id).toBe('AGENT-1');
      }
    });
  });
});
