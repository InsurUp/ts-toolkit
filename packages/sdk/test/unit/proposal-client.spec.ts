/**
 * @fileoverview Proposal Client Unit Tests
 * @description Wire-level tests for proposal endpoints whose routes/payloads must match
 * the deployed InsurUp API (source of truth: InsurUpApiEndpoints.cs in the core repo).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Proposal Client', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: { retries: 0, minTimeout: 1, maxTimeout: 2, factor: 1, randomize: false },
    });
  });

  describe('addManualProduct', () => {
    const request = {
      proposalId: 'PROP-1',
      insuranceCompanyId: 42,
      insuranceProductId: 7,
      grossPremium: 1234.56,
      insuranceCompanyProposalNumber: 'ICP-999',
    };

    it('posts multipart form data with PascalCase field names to the manual products route', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(200));

      const result = await client.proposals.addManualProduct(request);

      expect(result.isSuccess).toBe(true);
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/products/manual');
      expect(init.method).toBe('POST');
      expect(init.body).toBeInstanceOf(FormData);
      const form = init.body as FormData;
      expect(form.get('ProposalId')).toBe('PROP-1');
      expect(form.get('InsuranceCompanyId')).toBe('42');
      expect(form.get('InsuranceProductId')).toBe('7');
      expect(form.get('GrossPremium')).toBe('1234.56');
      expect(form.get('InsuranceCompanyProposalNumber')).toBe('ICP-999');
      expect(form.get('file')).toBeNull();
    });

    it('attaches the optional PDF under the "file" form field', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(200));

      const pdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
      await client.proposals.addManualProduct(request, { content: pdf, fileName: 'quote.pdf' });

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const file = (init.body as FormData).get('file');
      expect(file).toBeInstanceOf(File);
      expect((file as File).name).toBe('quote.pdf');
    });
  });

  describe('document endpoints', () => {
    it('fetches the product document without a language query by default', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ url: 'https://x/doc.pdf' }));

      await client.proposals.fetchProposalProductDocument({
        proposalId: 'PROP-1',
        proposalProductId: 'PP-2',
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/products/PP-2/document');
    });

    it('appends the language query to the product document route when provided', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ url: 'https://x/doc.pdf' }));

      await client.proposals.fetchProposalProductDocument({
        proposalId: 'PROP-1',
        proposalProductId: 'PP-2',
        language: 'en',
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe(
        'https://test.api.com/api/proposals/PROP-1/products/PP-2/document?language=en'
      );
    });

    it('fetches the information form from the information-form-document route', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ url: 'https://x/form.pdf' }));

      await client.proposals.fetchProposalInformationFormDocument({
        proposalId: 'PROP-1',
        proposalProductId: 'PP-2',
        language: 'tr',
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe(
        'https://test.api.com/api/proposals/PROP-1/products/PP-2/information-form-document?language=tr'
      );
    });

    it('sends the information form via the information-form-document send route', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(200));

      await client.proposals.sendProposalInformationFormDocument({
        proposalId: 'PROP-1',
        proposalProductId: 'PP-2',
        customerId: 'CUST-1',
        communication: { type: 'email', email: 'a@b.c' },
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe(
        'https://test.api.com/api/proposals/PROP-1/products/PP-2/information-form-document/send'
      );
    });

    it('generates the customer proposal document under the products segment', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ url: 'https://x/c.pdf' }));

      await client.proposals.generateCustomerProposalDocumentPdf({
        proposalId: 'PROP-1',
        proposalProductIds: ['PP-2'],
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/products/customer-document-pdf');
    });
  });

  describe('getProposalProductPremiumDetail', () => {
    it('reads the premium detail from the premiums route', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json({
          proposalId: 'PROP-1',
          proposalProductId: 'PP-2',
          installmentNumber: 3,
        })
      );

      await client.proposals.getProposalProductPremiumDetail('PROP-1', 'PP-2', 3);

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/products/PP-2/premiums/3');
    });
  });

  describe('reviseProposal', () => {
    it('posts coverageGroupIds in the body (backend ReviseProposalEndpointRequest shape)', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ proposalId: 'PROP-2' }));

      await client.proposals.reviseProposal({
        proposalId: 'PROP-1',
        coverageGroupIds: ['CG-1', 'CG-2'],
      });

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/revise');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        proposalId: 'PROP-1',
        coverageGroupIds: ['CG-1', 'CG-2'],
      });
    });
  });

  describe('setProposalBranch', () => {
    it('PUTs agentBranchId to the branch route (POST is 405 on the deployed endpoint)', async () => {
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(200));

      await client.proposals.setProposalBranch({
        proposalId: 'PROP-1',
        agentBranchId: 'BR-9',
      });

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://test.api.com/api/proposals/PROP-1/branch');
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body as string)).toEqual({
        proposalId: 'PROP-1',
        agentBranchId: 'BR-9',
      });
    });
  });
});
