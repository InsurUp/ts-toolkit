import type { HttpTransport } from '../client/http.js';
import type { GraphQLTransport } from '../client/graphql.js';
import type { InsurUpResult, InsurUpGraphQLResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { agentUsers } from '../core/endpoints.js';
import {
  ALL_AGENT_USER_FIELDS,
  type AgentUserFieldKey,
  type GetAgentUsersOptions,
  type AgentUsersConnection,
} from '@insurup/contracts';
import { buildFieldSelection } from '@insurup/contracts';
import { buildFilterSearchVariables } from './_internal/build-filter-search-variables.js';
import type {
  GetAgentUserResult,
  UpdateMyAgentUserRequest,
  InviteAgentUserRequest,
  AcceptAgentUserInviteRequest,
  UpdateAgentUserRequest,
  UpdateAgentUserPasswordRequest,
  GetMyAgentUserRobotCodeResult,
  MigrateAllAgentUsersResult,
} from '@insurup/contracts';

/**
 * Provides comprehensive user management operations for insurance agency staff, enabling agencies to manage
 * their team members, permissions, and access control within the InsurUp platform ecosystem.
 *
 * Sigorta acente personeli için kapsamlı kullanıcı yönetimi işlemlerini sağlar; acentelerin InsurUp platform
 * ekosistemi içinde ekip üyelerini, izinlerini ve erişim kontrolünü yönetmesine olanak tanır.
 */
export class InsurUpAgentUserClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport
  ) {}

  /**
   * Retrieves the current agent user's profile information including personal details and platform settings.
   *
   * Mevcut acente kullanıcısının kişisel detayları ve platform ayarları dahil profil bilgilerini getirir.
   *
   * @returns Current agent user profile / Mevcut acente kullanıcı profili
   */
  async getMyAgentUser(options?: RequestOptions): Promise<InsurUpResult<GetAgentUserResult>> {
    return this.http.get<GetAgentUserResult>(agentUsers.me, options);
  }

  /**
   * Updates the current agent user's profile information such as contact details and preferences.
   *
   * Mevcut acente kullanıcısının iletişim detayları ve tercihleri gibi profil bilgilerini günceller.
   *
   * @param request Profile update request / Profil güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateMyAgentUser(
    request: UpdateMyAgentUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(agentUsers.updateMyUser, request, options);
  }

  /**
   * Sends an invitation to a new user to join the agency team with specified role and permissions.
   *
   * Belirtilen rol ve izinlerle acente takımına katılması için yeni bir kullanıcıya davetiye gönderir.
   *
   * @param request User invitation request with role and contact information / Rol ve iletişim bilgileri ile kullanıcı davet talebi
   * @returns Operation result / İşlem sonucu
   */
  async inviteAgentUser(
    request: InviteAgentUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(agentUsers.invite, request, options);
  }

  /**
   * Activates an agent user account, granting them access to the platform and enabling their permissions.
   *
   * Bir acente kullanıcı hesabını aktive eder, platform erişimi verir ve izinlerini etkinleştirir.
   *
   * @param agentUserId Unique identifier of the agent user to activate / Aktive edilecek acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async activateAgentUser(agentUserId: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = agentUsers.activate.render(agentUserId);
    return this.http.postNoContent(endpoint, undefined, options);
  }

  /**
   * Deactivates an agent user account, suspending their access while preserving their profile data.
   *
   * Bir acente kullanıcı hesabını deaktive eder, profil verilerini korurken erişimlerini askıya alır.
   *
   * @param agentUserId Unique identifier of the agent user to deactivate / Deaktive edilecek acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deactivateAgentUser(agentUserId: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = agentUsers.deactivate.render(agentUserId);
    return this.http.postNoContent(endpoint, undefined, options);
  }

  /**
   * Validates an agent user invitation code to ensure it is legitimate and has not expired.
   *
   * Bir acente kullanıcı davet kodunun meşru olduğunu ve süresinin dolmadığını doğrular.
   *
   * @param code Invitation code to validate / Doğrulanacak davet kodu
   * @returns Operation result / İşlem sonucu
   */
  async checkAgentUserInviteCode(code: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = agentUsers.checkAgentUserInviteCode.render(code);
    // Note: GET always expects content, but this validation endpoint may return 204
    // If this causes issues, the API should be updated to return a response body
    return this.http.get<void>(endpoint, options) as Promise<InsurUpResult>;
  }

  /**
   * Permanently removes an agent user account and all associated data from the agency.
   *
   * Bir acente kullanıcı hesabını ve tüm ilişkili verileri acenteden kalıcı olarak kaldırır.
   *
   * @param agentUserId Unique identifier of the agent user to delete / Silinecek acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deleteAgentUser(agentUserId: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = agentUsers.delete.render(agentUserId);
    return this.http.deleteNoContent(endpoint, options);
  }

  /**
   * Retrieves detailed information about a specific agent user including their role and current status.
   *
   * Belirli bir acente kullanıcısı hakkında rolü ve mevcut durumu dahil detaylı bilgileri getirir.
   *
   * @param agentUserId Unique identifier of the agent user / Acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Agent user details / Acente kullanıcı detayları
   */
  async getAgentUserById(
    agentUserId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentUserResult>> {
    const endpoint = agentUsers.getById.render(agentUserId);
    return this.http.get<GetAgentUserResult>(endpoint, options);
  }

  /**
   * Resends an invitation email to an agent user who may not have received or lost their original invitation.
   *
   * Orijinal davetiyesini almamış veya kaybetmiş olabilecek bir acente kullanıcısına davet e-postasını yeniden gönderir.
   *
   * @param agentUserId Unique identifier of the agent user to resend invitation / Davetiyesi yeniden gönderilecek acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async reSendInviteAgentUser(
    agentUserId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agentUsers.reSendInvite.render(agentUserId);
    return this.http.postNoContent(endpoint, undefined, options);
  }

  /**
   * Accepts an agent user invitation and completes the registration process for the new team member.
   *
   * Bir acente kullanıcı davetiyesini kabul eder ve yeni ekip üyesi için kayıt sürecini tamamlar.
   *
   * @param request Invitation acceptance request with user details / Kullanıcı detayları ile davetiye kabul talebi
   * @returns Operation result / İşlem sonucu
   */
  async acceptAgentUserInvite(
    request: AcceptAgentUserInviteRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(agentUsers.acceptInvite, request, options);
  }

  /**
   * Updates an agent user's profile information, role assignments, or access permissions by an administrator.
   *
   * Bir yönetici tarafından acente kullanıcısının profil bilgilerini, rol atamalarını veya erişim izinlerini günceller.
   *
   * @param request User update request with modified information / Değiştirilmiş bilgilerle kullanıcı güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateAgentUser(
    request: UpdateAgentUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agentUsers.update.render(request.id);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Updates an agent user's password for enhanced security or when requested by the user.
   *
   * Gelişmiş güvenlik için veya kullanıcı tarafından talep edildiğinde acente kullanıcısının şifresini günceller.
   *
   * @param request Password update request / Şifre güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateAgentUserPassword(
    request: UpdateAgentUserPasswordRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(agentUsers.updatePassword, request, options);
  }

  /**
   * Retrieves the current agent user's robot/automation code for API integrations and automated operations.
   *
   * API entegrasyonları ve otomatik işlemler için mevcut acente kullanıcısının robot/otomasyon kodunu getirir.
   *
   * @returns Agent user robot code / Acente kullanıcı robot kodu
   */
  async getMyAgentUserRobotCode(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetMyAgentUserRobotCodeResult>> {
    return this.http.get<GetMyAgentUserRobotCodeResult>(agentUsers.meRobotCode, options);
  }

  /**
   * Migrates an agent user from the legacy authentication system to the AuthServer.
   * Creates an auth user and links it via AuthUserId field. A password reset email will be sent.
   *
   * Acente kullanıcısını eski kimlik doğrulama sisteminden AuthServer'a taşır.
   * Auth kullanıcısı oluşturur ve AuthUserId alanı ile bağlar. Şifre sıfırlama e-postası gönderilir.
   *
   * @param agentUserId Unique identifier of the agent user to migrate / Taşınacak acente kullanıcısının benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async migrateAgentUser(agentUserId: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = agentUsers.migrate.render(agentUserId);
    return this.http.postNoContent(endpoint, undefined, options);
  }

  /**
   * Migrates all agent users in the current tenant that haven't been migrated yet.
   *
   * Henüz taşınmamış mevcut kiracıdaki tüm acente kullanıcılarını taşır.
   *
   * @returns Response with the count of migrated users / Taşınan kullanıcı sayısı ile yanıt
   */
  async migrateAllAgentUsers(
    options?: RequestOptions
  ): Promise<InsurUpResult<MigrateAllAgentUsersResult>> {
    return this.http.post<MigrateAllAgentUsersResult>(agentUsers.migrateAll, undefined, options);
  }

  // ============================================================================
  // GRAPHQL QUERIES
  // ============================================================================

  /**
   * Queries agent users using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak acente kullanıcılarını sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.agentUsers.getAgentUsers({ first: 10 });
   *
   * @example
   * // Type-safe field selection
   * const result = await client.agentUsers.getAgentUsers({
   *   select: ['id', 'email', 'firstName', 'state'] as const,
   *   first: 10,
   *   filter: { state: { eq: AgentUserState.Active } }
   * });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of agent users with type-narrowed fields
   */
  async getAgentUsers<const TFields extends AgentUserFieldKey[]>(
    requestOptions?: GetAgentUsersOptions<TFields>,
    options?: RequestOptions
  ): Promise<InsurUpGraphQLResult<AgentUsersConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        'GraphQL transport is not available. Ensure the client is properly initialized.'
      );
    }

    const fields = (requestOptions?.select ?? ALL_AGENT_USER_FIELDS) as AgentUserFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;

    const query = `
      query GetAgentUsers(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryAgentUserResultFilterInput
        $filter: filtering_QueryAgentUserResultFilterInput
        $order: [sorting_QueryAgentUserResultSortInput!]
      ) {
        agentUsersNew(
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
          totalCount
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

    const variables = {
      first: requestOptions?.first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      ...buildFilterSearchVariables(requestOptions?.filter),
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      agentUsersNew: Omit<AgentUsersConnection, 'nodes'>;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<AgentUsersConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.agentUsersNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.agentUsersNew,
        nodes,
      },
    } as InsurUpGraphQLResult<AgentUsersConnection<TFields>>;
  }
}
