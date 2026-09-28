/**
 * @fileoverview Me Contracts - Signed-in person's agencies, contexts and invitations
 * @description TypeScript contracts for the `me/*` endpoints, which answer about the person
 * holding the token rather than about an agency they are acting in
 */

/**
 * One agency the signed-in person is an active member of.
 *
 * Oturum açan kişinin aktif üyesi olduğu bir acente.
 */
export interface MyAgentResult {
  /** The value to send as the acting-agent header. / İşlem yapılan acente başlığında gönderilecek değer. */
  readonly agentId: string;
  readonly name: string;
  readonly logoUrl: string | null;
  /** Short name the central sign-in server addresses this agency by. / Merkezi giriş sunucusundaki kısa ad. */
  readonly slug: string | null;
}

/**
 * An open invitation waiting for the signed-in person.
 *
 * Oturum açan kişiyi bekleyen açık bir davet.
 */
export interface MyInviteResult {
  readonly inviteId: string;
  readonly agentId: string;
  readonly agentName: string;
  readonly agentLogoUrl: string | null;
  readonly roleNames: readonly string[];
  readonly createdAt: string;
}

/**
 * The signed-in account's active admin-panel context.
 *
 * Oturum açan hesabın aktif yönetim paneli bağlamı.
 */
export interface MyAdminPanelContextResult {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

/**
 * One active agency membership available to the signed-in account.
 *
 * Oturum açan hesabın kullanabileceği aktif bir acente üyeliği.
 */
export interface MyAgentContextResult {
  readonly agentId: string;
  readonly agentUserId: string;
  readonly agentName: string;
  readonly email: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

/**
 * Every active internal and agency context linked to the signed-in account.
 *
 * Oturum açan hesaba bağlı tüm aktif iç ve acente bağlamları.
 */
export interface MyContextsResult {
  readonly internal: MyAdminPanelContextResult | null;
  readonly agents: readonly MyAgentContextResult[];
}
