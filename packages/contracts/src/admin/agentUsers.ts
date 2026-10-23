/**
 * @fileoverview Admin Agent Users Contracts - Agency users across agencies
 * @description TypeScript contracts for the admin panel's `agent-users/*` endpoints
 */

/**
 * Migrates the active agency users that have no AuthServer account yet, across every agency or only one.
 * A user whose e-mail address an AuthServer account has already proven is linked to that account; everybody
 * else gets a new account and a set-password e-mail. Only one run can be in progress at a time.
 *
 * Henüz AuthServer hesabı olmayan aktif acente kullanıcılarını tüm acentelerde veya yalnızca birinde taşır.
 * E-posta adresini bir AuthServer hesabı zaten doğrulamışsa kullanıcı o hesaba bağlanır; diğer herkes için yeni
 * hesap açılır ve şifre belirleme e-postası gönderilir. Aynı anda yalnızca bir çalıştırma yapılabilir.
 */
export interface MigrateLegacyAgentUsersRequest {
  /** The one agency to migrate; omit or send null to migrate every agency. */
  readonly agentId?: string | null;
}

/**
 * What a legacy agency user migration run did with each user it picked up. Skipped and failed users stay
 * unmigrated; running the migration again retries the failed ones.
 *
 * Eski acente kullanıcısı taşımasının ele aldığı her kullanıcıyla ne yaptığı. Atlanan ve başarısız olan
 * kullanıcılar taşınmamış kalır; taşımayı yeniden çalıştırmak başarısız olanları tekrar dener.
 */
export interface MigrateLegacyAgentUsersResult {
  /** Users given a new AuthServer account; each is e-mailed a set-password link. */
  readonly createdCount: number;
  /** Users linked to the AuthServer account that had already proven their e-mail address. */
  readonly linkedCount: number;
  /** Users left alone because the account that proved their e-mail is already a member of their agency. */
  readonly skippedUserIds: readonly string[];
  /** Users the AuthServer refused or could not be reached for; a later run retries them. */
  readonly failedUserIds: readonly string[];
}
