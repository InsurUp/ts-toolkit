/**
 * @fileoverview Admin Users Client - Admin panel users
 * @description Invitations, profiles, deactivation, migration and the legacy sign-in's password flows
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CheckAdminPanelUserForgotPasswordCodeRequest,
  ForgotPasswordAdminPanelUserRequest,
  GetAdminPanelUserByIdResult,
  GetAdminPanelUsersResult,
  GetMyAdminPanelUserResult,
  InviteAdminPanelUserRequest,
  InviteAdminPanelUserResult,
  ResetPasswordAdminPanelUserRequest,
  UpdateAdminPanelUserPasswordRequest,
  UpdateAdminPanelUserRequest,
  UpdateMyAdminPanelUserRequest,
} from '@insurup/contracts';

/**
 * Operations on admin panel users: listing, inviting, updating, deactivating and migrating them, the signed-in
 * user's own profile, and the legacy sign-in's password flows.
 *
 * Admin panel kullanıcıları üzerindeki işlemler: listeleme, davet etme, güncelleme, deaktive etme ve taşıma,
 * oturum açan kullanıcının kendi profili ve eski girişin şifre akışları.
 */
export class InsurUpAdminUsersClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Every admin panel user.
   *
   * Tüm admin panel kullanıcıları.
   */
  async getAll(options?: RequestOptions): Promise<InsurUpResult<GetAdminPanelUsersResult[]>> {
    return this.http.get<GetAdminPanelUsersResult[]>(admin.users.getAll, options);
  }

  /**
   * One admin panel user.
   *
   * Tek bir admin panel kullanıcısı.
   *
   * @param id Admin panel user id / Admin panel kullanıcı id'si
   */
  async getById(
    id: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAdminPanelUserByIdResult>> {
    return this.http.get<GetAdminPanelUserByIdResult>(admin.users.byId.render(id), options);
  }

  /**
   * The signed-in admin panel user's own profile.
   *
   * Oturum açan admin panel kullanıcısının kendi profili.
   */
  async getMe(options?: RequestOptions): Promise<InsurUpResult<GetMyAdminPanelUserResult>> {
    return this.http.get<GetMyAdminPanelUserResult>(admin.users.me, options);
  }

  /**
   * Updates the signed-in admin panel user's own profile.
   *
   * Oturum açan admin panel kullanıcısının kendi profilini günceller.
   */
  async updateMe(
    request: UpdateMyAdminPanelUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(admin.users.me, request, options);
  }

  /**
   * Changes the signed-in admin panel user's legacy sign-in password.
   *
   * Oturum açan admin panel kullanıcısının eski giriş şifresini değiştirir.
   */
  async updateMyPassword(
    request: UpdateAdminPanelUserPasswordRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.updateMyPassword, request, options);
  }

  /**
   * Invites a person to the admin panel and returns the id of the new, pending user.
   *
   * Bir kişiyi admin panele davet eder ve yeni, beklemedeki kullanıcının id'sini döndürür.
   */
  async invite(
    request: InviteAdminPanelUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InviteAdminPanelUserResult>> {
    return this.http.post<InviteAdminPanelUserResult>(admin.users.invite, request, options);
  }

  /**
   * Replaces an admin panel user's profile and roles.
   *
   * Bir admin panel kullanıcısının profilini ve rollerini değiştirir.
   *
   * @param id Admin panel user id / Admin panel kullanıcı id'si
   */
  async update(
    id: string,
    request: UpdateAdminPanelUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(admin.users.byId.render(id), { ...request, id }, options);
  }

  /**
   * Deletes an admin panel user.
   *
   * Bir admin panel kullanıcısını siler.
   *
   * @param id Admin panel user id / Admin panel kullanıcı id'si
   */
  async delete(id: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.users.byId.render(id), options);
  }

  /**
   * Deactivates an admin panel user: they lose access but their account is kept.
   *
   * Bir admin panel kullanıcısını deaktive eder: erişimini kaybeder ancak hesabı korunur.
   *
   * @param userId Admin panel user id / Admin panel kullanıcı id'si
   */
  async deactivate(userId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.deactivate.render(userId), { userId }, options);
  }

  /**
   * Sends a pending admin panel user a new invitation e-mail.
   *
   * Beklemedeki bir admin panel kullanıcısına yeni bir davet e-postası gönderir.
   *
   * @param adminPanelUserId Id of the pending admin panel user / Beklemedeki admin panel kullanıcısının id'si
   */
  async reSendInvite(adminPanelUserId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.users.reSendInvite.render(adminPanelUserId),
      { adminPanelUserId },
      options
    );
  }

  /**
   * Migrates an admin panel user's account to the AuthServer.
   *
   * Bir admin panel kullanıcısının hesabını AuthServer'a taşır.
   *
   * @param userId Admin panel user id / Admin panel kullanıcı id'si
   */
  async migrate(userId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.migrate.render(userId), { userId }, options);
  }

  /**
   * Starts the legacy sign-in's password reset by e-mailing a reset code. Needs no token.
   *
   * Sıfırlama kodunu e-postayla göndererek eski girişin şifre sıfırlamasını başlatır. Token gerektirmez.
   */
  async forgotPassword(
    request: ForgotPasswordAdminPanelUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.forgotPassword, request, options);
  }

  /**
   * Sets a new legacy sign-in password with the code from the reset e-mail. Needs no token.
   *
   * Sıfırlama e-postasındaki kodla yeni bir eski giriş şifresi belirler. Token gerektirmez.
   */
  async resetPassword(
    request: ResetPasswordAdminPanelUserRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.resetPassword, request, options);
  }

  /**
   * Checks that a password reset code is still valid; an invalid one comes back as an error. Needs no token.
   *
   * Bir şifre sıfırlama kodunun hâlâ geçerli olduğunu kontrol eder; geçersiz kod hata olarak döner. Token
   * gerektirmez.
   */
  async checkForgotPasswordToken(
    request: CheckAdminPanelUserForgotPasswordCodeRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.users.checkForgotPasswordToken, request, options);
  }
}
