/**
 * @fileoverview Admin Agents Client - Agencies: listing, activation, subscriptions and billing
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import { EDocumentType } from '@insurup/contracts';
import type {
  AttachAgentPaymentManualInvoiceRequest,
  GetAgentBillingActivitiesRequest,
  GetAgentBillingActivitiesResult,
  GetAgentBillingSummaryResult,
  GetAgentPaymentInvoicePdfResult,
  GetAgentPaymentsRequest,
  GetAgentPaymentsResult,
  GetAllAgentsRequest,
  GetAllAgentsResult,
  RecordAgentManualPaymentRequest,
  SetAgentBillingModeRequest,
  SetAgentPriceOverrideRequest,
  UpdateAgentSubscriptionRequest,
} from '@insurup/contracts';

/**
 * Multipart form fields bind enums by their C# member name, not by the JSON wire value.
 */
const documentTypeFormValues: Readonly<Record<EDocumentType, string>> = {
  [EDocumentType.EInvoice]: 'EInvoice',
  [EDocumentType.EArchive]: 'EArchive',
};

/**
 * Agencies across the platform: listing, activation, subscriptions and billing.
 *
 * Platformdaki acenteler: listeleme, etkinleştirme, abonelikler ve faturalama.
 */
export class InsurUpAdminAgentsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Lists the agencies, one page at a time.
   *
   * Acenteleri sayfa sayfa listeler.
   *
   * @param query Page (1-based, default 1) and page size (default 20) / Sayfa (1 tabanlı, varsayılan 1) ve sayfa boyutu (varsayılan 20)
   */
  async getAll(
    query?: GetAllAgentsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAllAgentsResult>> {
    return this.http.get<GetAllAgentsResult>(admin.agents.getAll.render(query), options);
  }

  /**
   * Reactivates a disabled agency, so its users can sign in again.
   *
   * Devre dışı bırakılmış bir acenteyi yeniden etkinleştirir; kullanıcıları tekrar giriş yapabilir.
   *
   * @param agentId Agent id / Acente kimliği
   */
  async activate(agentId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.agents.activate.render(agentId), { agentId }, options);
  }

  /**
   * Disables an agency: its users can no longer sign in, refresh tokens or accept invitations.
   *
   * Bir acenteyi devre dışı bırakır: kullanıcıları giriş yapamaz, token yenileyemez, davet kabul edemez.
   *
   * @param agentId Agent id / Acente kimliği
   */
  async disable(agentId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.agents.disable.render(agentId), { agentId }, options);
  }

  /**
   * Sets an agency's subscription plan, billing anchor day and per-agent overrides.
   *
   * Bir acentenin abonelik planını, faturalama gününü ve acente bazlı override'larını ayarlar.
   *
   * @param agentId Agent id / Acente kimliği
   * @param request Plan, anchor day and overrides / Plan, faturalama günü ve override'lar
   */
  async updateSubscription(
    agentId: string,
    request: UpdateAgentSubscriptionRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.agents.updateSubscription.render(agentId),
      request,
      options
    );
  }

  /**
   * Reads an agency's billing agreement: plan, limits, billing mode, prices, next charge, dunning and card.
   *
   * Bir acentenin faturalama sözleşmesini okur: plan, limitler, faturalama modu, fiyatlar, sonraki
   * tahsilat, gecikme ve kart.
   *
   * @param agentId Agent id / Acente kimliği
   */
  async getBillingSummary(
    agentId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentBillingSummaryResult>> {
    return this.http.get<GetAgentBillingSummaryResult>(
      admin.agents.getBillingSummary.render(agentId),
      options
    );
  }

  /**
   * Lists an agency's payments with their invoice state, newest first.
   *
   * Bir acentenin ödemelerini fatura durumlarıyla birlikte, en yeni önce listeler.
   *
   * @param agentId Agent id / Acente kimliği
   * @param query Page (1-based, default 1) and page size (default 20) / Sayfa ve sayfa boyutu
   */
  async getPayments(
    agentId: string,
    query?: GetAgentPaymentsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentPaymentsResult>> {
    return this.http.get<GetAgentPaymentsResult>(
      admin.agents.getPayments.render(agentId, query),
      options
    );
  }

  /**
   * Lists an agency's subscription activity timeline, newest first.
   *
   * Bir acentenin abonelik aktivite geçmişini en yeni önce listeler.
   *
   * @param agentId Agent id / Acente kimliği
   * @param query Page (1-based, default 1) and page size (default 20) / Sayfa ve sayfa boyutu
   */
  async getBillingActivities(
    agentId: string,
    query?: GetAgentBillingActivitiesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentBillingActivitiesResult>> {
    return this.http.get<GetAgentBillingActivitiesResult>(
      admin.agents.getBillingActivities.render(agentId, query),
      options
    );
  }

  /**
   * Records an already-settled offline payment. Never charges a card.
   *
   * Tahsil edilmiş çevrim dışı bir ödemeyi kaydeder. Karttan tahsilat yapmaz.
   *
   * @param agentId Agent id / Acente kimliği
   * @param request Amount, date, note and whether it settles the cycle / Tutar, tarih, not ve dönemi kapatıp kapatmadığı
   */
  async recordManualPayment(
    agentId: string,
    request: RecordAgentManualPaymentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.agents.recordManualPayment.render(agentId),
      request,
      options
    );
  }

  /**
   * Sets an agency's billing mode. Automatic billing needs a saved card.
   *
   * Bir acentenin faturalama modunu ayarlar. Otomatik faturalama kayıtlı kart gerektirir.
   *
   * @param agentId Agent id / Acente kimliği
   * @param request The billing mode / Faturalama modu
   */
  async setBillingMode(
    agentId: string,
    request: SetAgentBillingModeRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.agents.setBillingMode.render(agentId), request, options);
  }

  /**
   * Sets the monthly price agreed with an agency, or clears it with a null amount.
   *
   * Acenteyle anlaşılan aylık fiyatı ayarlar ya da null tutarla temizler.
   *
   * @param agentId Agent id / Acente kimliği
   * @param request The agreed monthly price, net of VAT / KDV hariç anlaşılan aylık fiyat
   */
  async setPriceOverride(
    agentId: string,
    request: SetAgentPriceOverrideRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.agents.setPriceOverride.render(agentId), request, options);
  }

  /**
   * Queues the (re-)issue of a settled card payment's invoice through the invoicing provider. Refused
   * when the payment already has an invoice or is an offline payment.
   *
   * Tahsil edilmiş bir kart ödemesinin faturasını fatura sağlayıcısı üzerinden (yeniden) kesmek için
   * kuyruğa alır. Ödemenin zaten faturası varsa veya çevrim dışı bir ödemeyse reddedilir.
   *
   * @param agentId Agent id / Acente kimliği
   * @param paymentId Payment id / Ödeme kimliği
   */
  async issuePaymentInvoice(
    agentId: string,
    paymentId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.agents.issuePaymentInvoice.render(agentId, paymentId),
      undefined,
      options
    );
  }

  /**
   * Records an invoice issued outside the platform against a settled payment, with an optional PDF.
   * Sent as `multipart/form-data`. Refused when the payment already has an invoice.
   *
   * Platform dışında kesilmiş bir faturayı, isteğe bağlı PDF ile tahsil edilmiş bir ödemeye kaydeder.
   * `multipart/form-data` olarak gönderilir. Ödemenin zaten faturası varsa reddedilir.
   *
   * @param agentId Agent id / Acente kimliği
   * @param paymentId Payment id / Ödeme kimliği
   * @param request Invoice details and the optional PDF / Fatura bilgileri ve isteğe bağlı PDF
   */
  async attachPaymentManualInvoice(
    agentId: string,
    paymentId: string,
    request: AttachAgentPaymentManualInvoiceRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const form = new FormData();
    form.append('invoiceNumber', request.invoiceNumber);
    form.append('issuedAt', request.issuedAt);
    form.append('documentType', documentTypeFormValues[request.documentType]);
    if (request.note) {
      form.append('note', request.note);
    }
    if (request.file) {
      if (request.fileName === undefined) {
        form.append('file', request.file);
      } else {
        form.append('file', request.file, request.fileName);
      }
    }
    return this.http.postNoContent(
      admin.agents.attachPaymentManualInvoice.render(agentId, paymentId),
      form,
      options
    );
  }

  /**
   * Returns a short-lived download link to a payment's invoice PDF.
   *
   * Bir ödemenin fatura PDF'i için kısa ömürlü bir indirme bağlantısı döndürür.
   *
   * @param agentId Agent id / Acente kimliği
   * @param paymentId Payment id / Ödeme kimliği
   */
  async getPaymentInvoicePdf(
    agentId: string,
    paymentId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentPaymentInvoicePdfResult>> {
    return this.http.get<GetAgentPaymentInvoicePdfResult>(
      admin.agents.getPaymentInvoicePdf.render(agentId, paymentId),
      options
    );
  }
}
