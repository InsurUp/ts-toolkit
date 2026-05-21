/**
 * Customer management client for the InsurUp TypeScript SDK.
 */

import type { HttpTransport } from '../client/http.js';
import type { GraphQLTransport } from '../client/graphql.js';
import type { InsurUpResult, InsurUpGraphQLResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { endpoints } from '../core/endpoints.js';
import type {
  CreateCustomerRequest,
  CreateCustomerResult,
  GetCustomerResult,
  UpdateCustomerRequest,
  AddCustomerEmailRequest,
  RemoveCustomerEmailRequest,
  ChangePrimaryCustomerEmailRequest,
  GetCustomerEmailsResultItem,
  AddCustomerPhoneNumberRequest,
  RemoveCustomerPhoneNumberRequest,
  ChangePrimaryCustomerPhoneNumberRequest,
  GetCustomerPhoneNumbersResultItem,
  GetPrimaryCustomerEmailResult,
  SetPrimaryCustomerEmailRequest,
  GetPrimaryCustomerPhoneNumberResult,
  SetPrimaryCustomerPhoneNumberRequest,
  GetCustomerAssetsResultItem,
  SetCustomerRepresentativeRequest,
  GetCustomerHealthInfoResult,
  UpdateCustomerHealthInfoRequest,
  CreateContactFlowRequest,
  CreateCustomerContactRequest,
  EndContactFlowRequest,
  GetCustomerContactFlowsResultItem,
  GetCustomerContactsResultItem,
  ExternalLookupCustomerRequest,
  ExternalLookupCustomerResult,
  SetCustomerBranchRequest,
  CreateCustomerAddressRequest,
  CreateCustomerAddressResult,
  UpdateCustomerAddressRequest,
  GetCustomerAddressResult,
  GiveCustomerConsentRequest,
  GetCustomerConsentsResult,
  ConsentType,
} from '@insurup/contracts';
import {
  ALL_CUSTOMER_FIELDS,
  CustomerType,
  type CustomerFieldKey,
  type GetCustomersOptions,
  type CustomersConnection,
} from '@insurup/contracts';
import { buildFieldSelection } from '@insurup/contracts';
import { buildFilterSearchVariables } from './_internal/build-filter-search-variables.js';

/**
 * Customer management client providing comprehensive customer lifecycle management.
 */
export class InsurUpCustomerClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport
  ) {}

  /**
   * Creates a new customer profile with essential personal and contact information.
   */
  async createCustomer(
    request: CreateCustomerRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateCustomerResult>> {
    // Transform request: type -> $type with lowercase discriminator for API
    const { type, ...rest } = request;

    let $type: string;
    switch (type) {
      case CustomerType.Individual:
        $type = 'individual';
        break;
      case CustomerType.Company:
        $type = 'company';
        break;
      case CustomerType.Foreign:
        $type = 'foreign';
        break;
    }

    return this.http.post<CreateCustomerResult>(
      endpoints.customers.createCustomer,
      { $type, ...rest },
      options
    );
  }

  /**
   * Retrieves detailed information about a specific customer.
   */
  async getCustomer(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerResult>> {
    return this.http.get<GetCustomerResult>(
      endpoints.customers.getCustomer.render(customerId),
      options
    );
  }

  /**
   * Retrieves the profile information of the currently authenticated customer.
   */
  async getCurrentCustomer(options?: RequestOptions): Promise<InsurUpResult<GetCustomerResult>> {
    return this.http.get<GetCustomerResult>(endpoints.customers.getCurrentCustomer, options);
  }

  /**
   * Updates existing customer profile information.
   */
  async updateCustomer(
    request: UpdateCustomerRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.customers.updateCustomer.render(request.id),
      request,
      options
    );
  }

  /**
   * Permanently removes a customer profile and all associated data.
   */
  async deleteCustomer(customerId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      endpoints.customers.deleteCustomer.render(customerId),
      options
    );
  }

  /**
   * Retrieves all email addresses associated with a customer.
   */
  async getCustomerEmails(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerEmailsResultItem[]>> {
    return this.http.get<GetCustomerEmailsResultItem[]>(
      endpoints.customers.emails.getCustomerEmails.render(customerId),
      options
    );
  }

  /**
   * Adds a new email address to a customer's contact information.
   */
  async addCustomerEmail(
    request: AddCustomerEmailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.emails.addCustomerEmail.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Removes an email address from a customer's contact information.
   */
  async removeCustomerEmail(
    request: RemoveCustomerEmailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      endpoints.customers.emails.removeCustomerEmail.render(request),
      options
    );
  }

  /**
   * Changes the primary email address for a customer.
   */
  async changePrimaryCustomerEmail(
    request: ChangePrimaryCustomerEmailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.emails.changePrimaryCustomerEmail.render(request),
      undefined,
      options
    );
  }

  /**
   * Retrieves the primary email address for a customer.
   *
   * Müşterinin birincil e-posta adresini getirir.
   */
  async getPrimaryCustomerEmail(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPrimaryCustomerEmailResult>> {
    return this.http.get<GetPrimaryCustomerEmailResult>(
      endpoints.customers.emails.getPrimaryCustomerEmail.render(customerId),
      options
    );
  }

  /**
   * Sets the primary email address for a customer (upsert — adds to the customer's email
   * collection if missing, then marks it as primary).
   *
   * Müşterinin birincil e-posta adresini ayarlar (mevcut değilse koleksiyona ekler ve birincil
   * olarak işaretler).
   */
  async setPrimaryCustomerEmail(
    request: SetPrimaryCustomerEmailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.customers.emails.setPrimaryCustomerEmail.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Retrieves all phone numbers associated with a customer.
   */
  async getCustomerPhoneNumbers(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerPhoneNumbersResultItem[]>> {
    return this.http.get<GetCustomerPhoneNumbersResultItem[]>(
      endpoints.customers.phoneNumbers.getCustomerPhoneNumbers.render(customerId),
      options
    );
  }

  /**
   * Adds a new phone number to a customer's contact information.
   */
  async addCustomerPhoneNumber(
    request: AddCustomerPhoneNumberRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.phoneNumbers.addCustomerPhoneNumber.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Removes a phone number from a customer's contact information.
   */
  async removeCustomerPhoneNumber(
    request: RemoveCustomerPhoneNumberRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      endpoints.customers.phoneNumbers.removeCustomerPhoneNumber.render(request),
      options
    );
  }

  /**
   * Changes the primary phone number for a customer.
   */
  async changePrimaryCustomerPhoneNumber(
    request: ChangePrimaryCustomerPhoneNumberRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.phoneNumbers.changePrimaryCustomerPhoneNumber.render(request),
      undefined,
      options
    );
  }

  /**
   * Retrieves the primary phone number for a customer.
   *
   * Müşterinin birincil telefon numarasını getirir.
   */
  async getPrimaryCustomerPhoneNumber(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPrimaryCustomerPhoneNumberResult>> {
    return this.http.get<GetPrimaryCustomerPhoneNumberResult>(
      endpoints.customers.phoneNumbers.getPrimaryCustomerPhoneNumber.render(customerId),
      options
    );
  }

  /**
   * Sets the primary phone number for a customer (upsert — adds to the customer's phone
   * number collection if missing, then marks it as primary).
   *
   * Müşterinin birincil telefon numarasını ayarlar (mevcut değilse koleksiyona ekler ve
   * birincil olarak işaretler).
   */
  async setPrimaryCustomerPhoneNumber(
    request: SetPrimaryCustomerPhoneNumberRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.customers.phoneNumbers.setPrimaryCustomerPhoneNumber.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Retrieves all of a customer's insurable assets (vehicles and properties) in a single
   * polymorphic list discriminated by the `$type` field.
   *
   * Müşterinin tüm sigortalanabilir varlıklarını (araçlar ve mülkler) `$type` alanı ile
   * ayırt edilen tek bir polimorfik listede getirir.
   */
  async getCustomerAssets(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerAssetsResultItem[]>> {
    return this.http.get<GetCustomerAssetsResultItem[]>(
      endpoints.customers.getCustomerAssets.render(customerId),
      options
    );
  }

  /**
   * Assigns a specific agent representative to manage a customer's account.
   */
  async setCustomerRepresentative(
    request: SetCustomerRepresentativeRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.setCustomerRepresentative.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Assigns or changes the branch for a customer to organize customer segmentation and reporting.
   *
   * Müşteri segmentasyonu ve raporlama için müşterinin şubesini atar veya değiştirir.
   *
   * @param request Branch assignment request / Şube atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setCustomerBranch(
    request: SetCustomerBranchRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.setCustomerBranch.render(request.customerId),
      request,
      options
    );
  }

  // Address management methods

  /**
   * Creates a new customer address record using property number as the single source of truth.
   *
   * Tek doğruluk kaynağı olarak konut numarasını kullanarak yeni müşteri adres kaydı oluşturur.
   *
   * @param request Address creation request / Adres oluşturma talebi
   * @returns Created address information / Oluşturulan adres bilgileri
   */
  async createCustomerAddress(
    request: CreateCustomerAddressRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateCustomerAddressResult>> {
    return this.http.post<CreateCustomerAddressResult>(
      endpoints.customers.addresses.create.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Updates the type classification of an existing customer address.
   *
   * Mevcut bir müşteri adresinin tür sınıflandırmasını günceller.
   *
   * @param request Address update request / Adres güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateCustomerAddress(
    request: UpdateCustomerAddressRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.customers.addresses.update.render(request.customerId, request.addressId),
      request,
      options
    );
  }

  /**
   * Retrieves detailed information about a specific customer address.
   *
   * Belirli bir müşteri adresi hakkında detaylı bilgileri getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param addressId Unique identifier of the address / Adresin benzersiz tanımlayıcısı
   * @returns Address details / Adres detayları
   */
  async getCustomerAddressById(
    customerId: string,
    addressId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerAddressResult>> {
    return this.http.get<GetCustomerAddressResult>(
      endpoints.customers.addresses.getById.render(customerId, addressId),
      options
    );
  }

  /**
   * Retrieves all addresses owned by a specific customer for comprehensive address management.
   *
   * Kapsamlı adres yönetimi için belirli bir müşteriye ait tüm adresleri getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @returns Customer addresses / Müşteri adresleri
   */
  async getCustomerAddresses(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerAddressResult[]>> {
    return this.http.get<GetCustomerAddressResult[]>(
      endpoints.customers.addresses.getAll.render(customerId),
      options
    );
  }

  /**
   * Deletes a customer address from their address collection.
   *
   * Müşterinin adres koleksiyonundan bir adresi siler.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param addressId Unique identifier of the address to delete / Silinecek adresin benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deleteCustomerAddress(
    customerId: string,
    addressId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      endpoints.customers.addresses.delete.render(customerId, addressId),
      options
    );
  }

  // Consent management methods

  /**
   * Records customer consent for data processing or marketing communications in compliance with KVKK/ETK regulations.
   *
   * KVKK/ETK düzenlemelerine uygun olarak veri işleme veya pazarlama iletişimleri için müşteri iznini kaydeder.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param request Consent recording request / İzin kayıt talebi
   * @returns Operation result / İşlem sonucu
   */
  async giveCustomerConsent(
    customerId: string,
    request: GiveCustomerConsentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    // The deployed API also requires `customerId` in the request body even
    // though it's already in the path (and the OpenAPI spec doesn't declare
    // this). We inject it from the path arg so callers don't have to pass it
    // twice.
    return this.http.postNoContent(
      endpoints.customers.consents.give.render(customerId),
      { ...request, customerId },
      options
    );
  }

  /**
   * Revokes a previously granted customer consent in accordance with customer data rights.
   *
   * Müşteri veri hakları uyarınca önceden verilmiş bir müşteri iznini geri çeker.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param consentType Type of consent to revoke / Geri çekilecek izin türü
   * @returns Operation result / İşlem sonucu
   */
  async revokeCustomerConsent(
    customerId: string,
    consentType: ConsentType,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      endpoints.customers.consents.revoke.render(customerId, consentType),
      options
    );
  }

  /**
   * Retrieves both active consent states and complete consent history for a customer in a single optimized API call.
   *
   * Müşterinin hem aktif izin durumlarını hem de tam izin geçmişini tek bir optimize edilmiş API çağrısında getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @returns Active consent states and complete history / Aktif izin durumları ve tam geçmiş
   */
  async getCustomerConsents(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerConsentsResult>> {
    return this.http.get<GetCustomerConsentsResult>(
      endpoints.customers.consents.getAll.render(customerId),
      options
    );
  }

  /**
   * Retrieves comprehensive health information for a customer.
   */
  async getCustomerHealthInfo(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerHealthInfoResult>> {
    return this.http.get<GetCustomerHealthInfoResult>(
      endpoints.customers.getHealthInfo.render(customerId),
      options
    );
  }

  /**
   * Updates customer health information.
   */
  async updateCustomerHealthInfo(
    request: UpdateCustomerHealthInfoRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.customers.updateHealthInfo.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Initiates a new customer contact flow.
   */
  async createCustomerContactFlow(
    request: CreateContactFlowRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.contactFlows.createContactFlow.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Records a customer contact interaction.
   */
  async createCustomerContact(
    request: CreateCustomerContactRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.contacts.create.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Completes and closes a customer contact flow.
   */
  async endCustomerContactFlow(
    request: EndContactFlowRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.customers.contactFlows.endContactFlow.render(
        request.customerId,
        request.contactFlowId
      ),
      request,
      options
    );
  }

  /**
   * Retrieves all contact flows for a customer.
   */
  async getCustomerContactFlows(
    customerId: string,
    caseRef?: string | null,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerContactFlowsResultItem[]>> {
    return this.http.get<GetCustomerContactFlowsResultItem[]>(
      endpoints.customers.contactFlows.getCustomerContactFlows.render(customerId, caseRef),
      options
    );
  }

  /**
   * Retrieves all individual contact interactions for a customer.
   */
  async getCustomerContacts(
    customerId: string,
    caseRef?: string | null,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerContactsResultItem[]>> {
    return this.http.get<GetCustomerContactsResultItem[]>(
      endpoints.customers.contacts.getCustomerContacts.render(customerId, caseRef),
      options
    );
  }

  /**
   * Performs external customer data lookup.
   */
  async externalLookupCustomer(
    request: ExternalLookupCustomerRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ExternalLookupCustomerResult>> {
    return this.http.post<ExternalLookupCustomerResult>(
      endpoints.customers.externalLookup,
      request,
      options
    );
  }

  // ============================================
  // GraphQL Methods
  // ============================================

  /**
   * Retrieves a paginated list of customers using GraphQL with type-safe field selection.
   *
   * GraphQL kullanarak tip güvenli alan seçimi ile sayfalanmış müşteri listesi getirir.
   *
   * @example
   * // Get all fields
   * const result = await client.customers.getCustomers({ first: 10 });
   *
   * @example
   * // Type-safe field selection
   * const result = await client.customers.getCustomers({
   *   select: ['id', 'name', 'type', 'primaryEmail'] as const,
   *   first: 10,
   *   filter: { type: { eq: CustomerType.INDIVIDUAL } }
   * });
   * // result.data.nodes[0].id    - ✓ string
   * // result.data.nodes[0].name  - ✓ string | null
   * // result.data.nodes[0].type  - ✓ CustomerType
   * // result.data.nodes[0].birthDate - ✗ TypeScript Error!
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of customers with type-narrowed fields
   */
  async getCustomers<const TFields extends CustomerFieldKey[]>(
    requestOptions?: GetCustomersOptions<TFields>,
    options?: RequestOptions
  ): Promise<InsurUpGraphQLResult<CustomersConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        'GraphQL transport is not available. Ensure the client is properly initialized.'
      );
    }

    const fields = (requestOptions?.select ?? ALL_CUSTOMER_FIELDS) as CustomerFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;
    const includeTotalCount = requestOptions?.includeTotalCount !== false;

    const query = `
      query GetCustomers(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryCustomerModelFilterInput
        $filter: filtering_QueryCustomerModelFilterInput
        $order: [sorting_QueryCustomerModelSortInput!]
      ) {
        customersNew(
          first: $first
          after: $after
          last: $last
          before: $before
          search: $search
          filter: $filter
          order: $order
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          ${includeTotalCount ? 'totalCount' : ''}
          ${
            hasFieldSelection
              ? `edges {
            cursor
            node {
              ${fieldSelection}
            }
          }`
              : ''
          }
        }
      }
    `;

    // Default to first: 50 only when neither cursor-direction bound is given.
    const first =
      requestOptions?.first === undefined && requestOptions?.last === undefined
        ? 50
        : requestOptions?.first;
    const variables = {
      first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      ...buildFilterSearchVariables(requestOptions?.filter),
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      customersNew: Omit<CustomersConnection, 'nodes'>;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<CustomersConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.customersNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    // Return the customersNew data with derived nodes
    return {
      ...result,
      data: {
        ...result.data.customersNew,
        nodes,
      },
    } as InsurUpGraphQLResult<CustomersConnection<TFields>>;
  }
}
