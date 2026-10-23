import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  AutoPaymentSetupFailureReason,
  BillingMode,
  EDocumentType,
  Feature,
  InvoiceBuyerDetail,
  Module,
  ProductBranch,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, validationError, setupIntegrationTest } from './setup';
import {
  sampleAdminAgentId,
  sampleAdminPaymentId,
  sampleAgentBillingActivities,
  sampleAgentBillingSummary,
  sampleAgentPayments,
  sampleGetAllAgentsResult,
} from './fixtures/admin-agents';

const t = setupIntegrationTest();

const agentPath = `${BASE_URL}/agents/:agentId`;
const paymentPath = `${agentPath}/billing/payments/:paymentId`;

describe('AdminAgentsClient', () => {
  it('getAll GETs /agents with paging query and returns the page', async () => {
    let methodSeen: string | undefined;
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`${BASE_URL}/agents`, ({ request }) => {
        methodSeen = request.method;
        query = new URL(request.url).searchParams;
        return HttpResponse.json(sampleGetAllAgentsResult);
      })
    );

    const result = await t.client.admin.agents.getAll({ page: 3, pageSize: 20 });

    expect(methodSeen).toBe('GET');
    expect(query?.get('page')).toBe('3');
    expect(query?.get('pageSize')).toBe('20');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.totalCount).toBe(41);
      expect(result.data.agents[0]?.subscription?.modules).toEqual([
        Module.Customer,
        Module.Proposal,
      ]);
      expect(result.data.agents[0]?.phoneNumber?.countryCode).toBe(90);
    }
  });

  it('getAll without a query sends no query string', async () => {
    let search: string | undefined;
    server.use(
      http.get(`${BASE_URL}/agents`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json(sampleGetAllAgentsResult);
      })
    );

    await t.client.admin.agents.getAll();

    expect(search).toBe('');
  });

  it('activate POSTs the agent id in path and body', async () => {
    let methodSeen: string | undefined;
    let agentId: unknown;
    let body: unknown;
    server.use(
      http.post(`${agentPath}/activate`, async ({ request, params }) => {
        methodSeen = request.method;
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.activate(sampleAdminAgentId);

    expect(methodSeen).toBe('POST');
    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({ agentId: sampleAdminAgentId });
    expect(result.kind).toBe('success');
  });

  it('disable POSTs the agent id in path and body and accepts an empty 200', async () => {
    let agentId: unknown;
    let body: unknown;
    server.use(
      http.post(`${agentPath}/disable`, async ({ request, params }) => {
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await t.client.admin.agents.disable(sampleAdminAgentId);

    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({ agentId: sampleAdminAgentId });
    expect(result.kind).toBe('success');
  });

  it('updateSubscription POSTs the plan and overrides to update-subscription', async () => {
    let methodSeen: string | undefined;
    let agentId: unknown;
    let body: unknown;
    server.use(
      http.post(`${agentPath}/update-subscription`, async ({ request, params }) => {
        methodSeen = request.method;
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.updateSubscription(sampleAdminAgentId, {
      subscriptionPlanId: 3,
      dayOfMonth: 1,
      userLimit: null,
      modules: [Module.Customer, Module.Policy],
      features: [Feature.ThreeDSecureProvider],
      supportedBranches: [ProductBranch.Kasko],
    });

    expect(methodSeen).toBe('POST');
    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({
      subscriptionPlanId: 3,
      dayOfMonth: 1,
      userLimit: null,
      modules: ['CUSTOMER', 'POLICY'],
      features: ['THREE_D_SECURE_PROVIDER'],
      supportedBranches: ['KASKO'],
    });
    expect(result.kind).toBe('success');
  });

  it('getBillingSummary GETs /agents/{id}/billing and parses integer enums', async () => {
    let agentId: unknown;
    server.use(
      http.get(`${agentPath}/billing`, ({ params }) => {
        agentId = params.agentId;
        return HttpResponse.json(sampleAgentBillingSummary);
      })
    );

    const result = await t.client.admin.agents.getBillingSummary(sampleAdminAgentId);

    expect(agentId).toBe(sampleAdminAgentId);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.billingMode).toBe(BillingMode.Auto);
      expect(result.data.monthlyCharge.gross).toBe(3000);
      expect(result.data.autoPaymentSetupFailure?.reason).toBe(
        AutoPaymentSetupFailureReason.EmailMissing
      );
      expect(result.data.autoPaymentSetupFailure?.reason).toBe(1);
    }
  });

  it('getBillingSummary maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${agentPath}/billing`, () => notFound('Agent not found')));

    const result = await t.client.admin.agents.getBillingSummary('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('getPayments GETs the payment page with paging query', async () => {
    let agentId: unknown;
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`${agentPath}/billing/payments`, ({ request, params }) => {
        agentId = params.agentId;
        query = new URL(request.url).searchParams;
        return HttpResponse.json(sampleAgentPayments);
      })
    );

    const result = await t.client.admin.agents.getPayments(sampleAdminAgentId, {
      page: 2,
      pageSize: 5,
    });

    expect(agentId).toBe(sampleAdminAgentId);
    expect(query?.get('page')).toBe('2');
    expect(query?.get('pageSize')).toBe('5');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.items[0]?.invoiceDocumentType).toBe(EDocumentType.EArchive);
      expect(result.data.items[0]?.invoiceMissingBuyerDetail).toBe(InvoiceBuyerDetail.TaxOffice);
    }
  });

  it('getBillingActivities GETs the timeline and narrows entries by $type', async () => {
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`${agentPath}/billing/activities`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(sampleAgentBillingActivities);
      })
    );

    const result = await t.client.admin.agents.getBillingActivities(sampleAdminAgentId, {
      page: 1,
    });

    expect(query?.get('page')).toBe('1');
    expect(query?.has('pageSize')).toBe(false);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      const first = result.data.items[0];
      expect(first?.$type).toBe('billing-mode-changed');
      if (first?.$type === 'billing-mode-changed') {
        expect(first.toMode).toBe(BillingMode.Auto);
      }
      const second = result.data.items[1];
      if (second?.$type === 'dunning-notice') {
        expect(second.recipient).toBeNull();
      }
    }
  });

  it('recordManualPayment POSTs the payment to billing/manual-payment', async () => {
    let methodSeen: string | undefined;
    let agentId: unknown;
    let body: unknown;
    server.use(
      http.post(`${agentPath}/billing/manual-payment`, async ({ request, params }) => {
        methodSeen = request.method;
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.recordManualPayment(sampleAdminAgentId, {
      amount: 3000,
      paymentDate: '2026-10-20T00:00:00Z',
      note: 'EFT 123',
      advanceBillingCycle: false,
    });

    expect(methodSeen).toBe('POST');
    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({
      amount: 3000,
      paymentDate: '2026-10-20T00:00:00Z',
      note: 'EFT 123',
      advanceBillingCycle: false,
    });
    expect(result.kind).toBe('success');
  });

  it('setBillingMode POSTs the mode to billing/mode', async () => {
    let body: unknown;
    let agentId: unknown;
    server.use(
      http.post(`${agentPath}/billing/mode`, async ({ request, params }) => {
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.setBillingMode(sampleAdminAgentId, {
      billingMode: BillingMode.Manual,
    });

    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({ billingMode: 'MANUAL' });
    expect(result.kind).toBe('success');
  });

  it('setPriceOverride POSTs a null amount to clear the override', async () => {
    let body: unknown;
    let agentId: unknown;
    server.use(
      http.post(`${agentPath}/billing/price-override`, async ({ request, params }) => {
        agentId = params.agentId;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.setPriceOverride(sampleAdminAgentId, {
      monthlyAmount: null,
    });

    expect(agentId).toBe(sampleAdminAgentId);
    expect(body).toEqual({ monthlyAmount: null });
    expect(result.kind).toBe('success');
  });

  it('issuePaymentInvoice POSTs without a body to invoice/issue', async () => {
    let methodSeen: string | undefined;
    let params: Record<string, unknown> | undefined;
    let bodyText: string | undefined;
    server.use(
      http.post(`${paymentPath}/invoice/issue`, async ({ request, params: routeParams }) => {
        methodSeen = request.method;
        params = routeParams;
        bodyText = await request.text();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.issuePaymentInvoice(
      sampleAdminAgentId,
      sampleAdminPaymentId
    );

    expect(methodSeen).toBe('POST');
    expect(params?.agentId).toBe(sampleAdminAgentId);
    expect(params?.paymentId).toBe(sampleAdminPaymentId);
    expect(bodyText).toBe('');
    expect(result.kind).toBe('success');
  });

  it('issuePaymentInvoice maps 409 to ResourceDuplicate', async () => {
    server.use(http.post(`${paymentPath}/invoice/issue`, () => conflict('Invoice already issued')));

    const result = await t.client.admin.agents.issuePaymentInvoice(
      sampleAdminAgentId,
      sampleAdminPaymentId
    );

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('attachPaymentManualInvoice POSTs multipart form fields and the PDF', async () => {
    let methodSeen: string | undefined;
    let contentType: string | null | undefined;
    let params: Record<string, unknown> | undefined;
    let form: FormData | undefined;
    server.use(
      http.post(`${paymentPath}/invoice/manual`, async ({ request, params: routeParams }) => {
        methodSeen = request.method;
        contentType = request.headers.get('content-type');
        params = routeParams;
        form = await request.formData();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const pdf = new Blob(['%PDF-1.7 test'], { type: 'application/pdf' });
    const result = await t.client.admin.agents.attachPaymentManualInvoice(
      sampleAdminAgentId,
      sampleAdminPaymentId,
      {
        invoiceNumber: 'GIB2026000000123',
        issuedAt: '2026-10-21',
        documentType: EDocumentType.EInvoice,
        note: 'Issued on the GİB portal',
        file: pdf,
        fileName: 'invoice-123.pdf',
      }
    );

    expect(methodSeen).toBe('POST');
    expect(contentType).toContain('multipart/form-data');
    expect(params?.agentId).toBe(sampleAdminAgentId);
    expect(params?.paymentId).toBe(sampleAdminPaymentId);
    expect(form?.get('invoiceNumber')).toBe('GIB2026000000123');
    expect(form?.get('issuedAt')).toBe('2026-10-21');
    expect(form?.get('documentType')).toBe('EInvoice');
    expect(form?.get('note')).toBe('Issued on the GİB portal');
    const file = form?.get('file');
    expect(file).toBeInstanceOf(File);
    if (file instanceof File) {
      expect(file.name).toBe('invoice-123.pdf');
      expect(await file.text()).toBe('%PDF-1.7 test');
    }
    expect(result.kind).toBe('success');
  });

  it('attachPaymentManualInvoice sends the e-Arşiv member name and omits absent note and file', async () => {
    let form: FormData | undefined;
    server.use(
      http.post(`${paymentPath}/invoice/manual`, async ({ request }) => {
        form = await request.formData();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agents.attachPaymentManualInvoice(
      sampleAdminAgentId,
      sampleAdminPaymentId,
      {
        invoiceNumber: 'EAR2026000000001',
        issuedAt: '2026-10-22',
        documentType: EDocumentType.EArchive,
      }
    );

    expect(form?.get('documentType')).toBe('EArchive');
    expect(form?.has('note')).toBe(false);
    expect(form?.has('file')).toBe(false);
    expect(result.kind).toBe('success');
  });

  it('attachPaymentManualInvoice maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${paymentPath}/invoice/manual`, () =>
        validationError([{ propertyName: 'file', errorMessage: 'Only .pdf files are allowed' }])
      )
    );

    const result = await t.client.admin.agents.attachPaymentManualInvoice(
      sampleAdminAgentId,
      sampleAdminPaymentId,
      {
        invoiceNumber: 'X',
        issuedAt: '2026-10-22',
        documentType: EDocumentType.EInvoice,
        file: new Blob(['not a pdf']),
        fileName: 'invoice.txt',
      }
    );

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('getPaymentInvoicePdf GETs invoice/pdf and returns the download link', async () => {
    let params: Record<string, unknown> | undefined;
    server.use(
      http.get(`${paymentPath}/invoice/pdf`, ({ params: routeParams }) => {
        params = routeParams;
        return HttpResponse.json({ url: 'https://files.example/invoice.pdf?sig=abc' });
      })
    );

    const result = await t.client.admin.agents.getPaymentInvoicePdf(
      sampleAdminAgentId,
      sampleAdminPaymentId
    );

    expect(params?.agentId).toBe(sampleAdminAgentId);
    expect(params?.paymentId).toBe(sampleAdminPaymentId);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.url).toBe('https://files.example/invoice.pdf?sig=abc');
    }
  });
});
