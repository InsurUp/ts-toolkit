/**
 * @fileoverview Admin Users Contracts - Admin panel users, their profiles and passwords
 * @description TypeScript contracts for the `admin-panel-users/*` endpoints: listing, inviting, updating,
 * deactivating and migrating admin panel users, the signed-in user's own profile, and the legacy
 * sign-in's password flows
 */

/**
 * Where an admin panel user account is in its lifecycle. Serialized as its upper-case name.
 *
 * Bir admin panel kullanıcı hesabının yaşam döngüsündeki yeri. Büyük harfli adıyla serileştirilir.
 */
export enum AdminPanelUserState {
  /** Invited but the invitation is not accepted yet. / Davet edildi, davet henüz kabul edilmedi. */
  Pending = 'PENDING',
  /** Can use the admin panel. / Admin paneli kullanabilir. */
  Active = 'ACTIVE',
  /** Deactivated; can no longer use the admin panel. / Deaktive edildi; admin paneli artık kullanamaz. */
  Inactive = 'INACTIVE',
}

/**
 * One admin panel user in the user list.
 *
 * Kullanıcı listesindeki bir admin panel kullanıcısı.
 */
export interface GetAdminPanelUsersResult {
  /** Admin panel user id. */
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  /** Names of the roles assigned to the user. */
  readonly roles: readonly string[];
  readonly state: AdminPanelUserState;
  /** The user's AuthServer account, or null while the user is not migrated to the AuthServer yet. */
  readonly authUserId: string | null;
}

/**
 * One admin panel user, as returned by the get-by-id endpoint. Carries no name and no AuthServer link.
 *
 * Id ile getirme endpoint'inin döndürdüğü tek bir admin panel kullanıcısı. Ad ve AuthServer bağlantısı içermez.
 */
export interface GetAdminPanelUserByIdResult {
  /** Admin panel user id. */
  readonly id: string;
  /** The user's e-mail address. Marked `[MaskedRedact]`: masked in the server's logs, returned in full here. */
  readonly email: string;
  /** Names of the roles assigned to the user. */
  readonly roles: readonly string[];
  readonly state: AdminPanelUserState;
}

/**
 * The signed-in admin panel user's own profile. Unlike the list item it carries no state.
 *
 * Oturum açan admin panel kullanıcısının kendi profili. Liste öğesinin aksine durum içermez.
 */
export interface GetMyAdminPanelUserResult {
  /** Admin panel user id. */
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  /** Names of the roles assigned to the user. */
  readonly roles: readonly string[];
  /** The user's AuthServer account, or null while the user is not migrated to the AuthServer yet. */
  readonly authUserId: string | null;
}

/**
 * Invites a person to the admin panel. They receive an invitation e-mail and stay pending until they accept it.
 *
 * Bir kişiyi admin panele davet eder. Kişi bir davet e-postası alır ve kabul edene kadar beklemede kalır.
 */
export interface InviteAdminPanelUserRequest {
  /** Address the invitation is sent to. */
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  /** Names of the roles the user gets once they accept. */
  readonly roles: readonly string[];
}

/**
 * The admin panel user an invitation created.
 *
 * Davetin oluşturduğu admin panel kullanıcısı.
 */
export interface InviteAdminPanelUserResult {
  /** Id of the new, pending admin panel user. */
  readonly id: string;
}

/**
 * Replaces an admin panel user's profile and roles. The user id travels as the method's own parameter.
 *
 * Bir admin panel kullanıcısının profilini ve rollerini değiştirir. Kullanıcı id'si metodun kendi parametresidir.
 */
export interface UpdateAdminPanelUserRequest {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  /** Names of the roles the user should have; replaces the current ones. */
  readonly roles: readonly string[];
}

/**
 * Updates the signed-in admin panel user's own profile.
 *
 * Oturum açan admin panel kullanıcısının kendi profilini günceller.
 */
export interface UpdateMyAdminPanelUserRequest {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}

/**
 * Changes the signed-in admin panel user's legacy sign-in password.
 *
 * Oturum açan admin panel kullanıcısının eski giriş şifresini değiştirir.
 */
export interface UpdateAdminPanelUserPasswordRequest {
  /** The password in use now. */
  readonly currentPassword: string;
  /** The new password; at least 8 characters. */
  readonly newPassword: string;
}

/**
 * Starts the legacy sign-in's password reset: a reset code is e-mailed to the address.
 *
 * Eski girişin şifre sıfırlamasını başlatır: adrese bir sıfırlama kodu e-postayla gönderilir.
 */
export interface ForgotPasswordAdminPanelUserRequest {
  /** The admin panel user's e-mail address. */
  readonly email: string;
}

/**
 * Checks whether a password reset code is still valid before asking for a new password.
 *
 * Yeni şifre istemeden önce bir şifre sıfırlama kodunun hâlâ geçerli olup olmadığını kontrol eder.
 */
export interface CheckAdminPanelUserForgotPasswordCodeRequest {
  /** The code from the reset e-mail. */
  readonly code: string;
}

/**
 * Sets a new legacy sign-in password with the code from the reset e-mail.
 *
 * Sıfırlama e-postasındaki kodla yeni bir eski giriş şifresi belirler.
 */
export interface ResetPasswordAdminPanelUserRequest {
  /** The code from the reset e-mail. */
  readonly code: string;
  /** The new password; at least 8 characters. */
  readonly password: string;
}
