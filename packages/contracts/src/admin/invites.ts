/**
 * @fileoverview Admin Invites Contracts - The signed-in person's admin panel invitations
 * @description TypeScript contracts for the `me/admin-panel/*` endpoints
 */

/**
 * An open admin panel invitation waiting for the signed-in person. Carries no e-mail address: the recipient
 * already proved it to see the invitation.
 *
 * Oturum açan kişiyi bekleyen açık bir admin panel daveti. E-posta adresi içermez: alıcı daveti görebilmek
 * için adresi zaten kanıtlamıştır.
 */
export interface MyAdminPanelInviteResult {
  /** Identifies the invitation when accepting or declining it. */
  readonly inviteId: string;
  /** Names of the roles the invitation offers. */
  readonly roleNames: readonly string[];
  /** When the invitation was issued (ISO-8601). */
  readonly createdAt: string;
}
