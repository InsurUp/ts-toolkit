/**
 * @fileoverview OAuth Client Contracts - OAuth client management operations
 * @description TypeScript contracts for listing, retrieving, creating, updating,
 * and deleting OAuth clients. Mirrors the backend `InsurUp.Api.Contracts`
 * OAuth client request/response models.
 */

/**
 * OAuth 2.0 client type. Mirrors the backend `OAuthClientType` enum, which is
 * serialized as its numeric value over the wire.
 *
 * OAuth 2.0 istemci türü. Tel üzerinde sayısal değeri ile serileştirilen
 * arka uç `OAuthClientType` enum'unu yansıtır.
 */
export enum OAuthClientType {
  /**
   * Confidential client with a client secret (server-side apps).
   *
   * İstemci sırrı olan gizli istemci (sunucu taraflı uygulamalar).
   */
  Confidential = 0,

  /**
   * Public client without a secret (native apps, SPAs).
   *
   * Sırrı olmayan herkese açık istemci (yerel uygulamalar, SPA'lar).
   */
  Public = 1,
}

/**
 * OAuth 2.0 application type. Controls redirect URI validation behavior.
 * Mirrors the backend `OAuthApplicationType` enum (serialized numerically).
 *
 * OAuth 2.0 uygulama türü. Yönlendirme URI doğrulama davranışını kontrol eder.
 * Arka uç `OAuthApplicationType` enum'unu (sayısal serileştirilen) yansıtır.
 */
export enum OAuthApplicationType {
  /**
   * Web application (default). Strict redirect URI validation.
   *
   * Web uygulaması (varsayılan). Katı yönlendirme URI doğrulaması.
   */
  Web = 0,

  /**
   * Native application (mobile, desktop). Relaxed localhost port validation.
   *
   * Yerel uygulama (mobil, masaüstü). Esnek localhost port doğrulaması.
   */
  Native = 1,
}

/**
 * OAuth 2.0 grant types supported by the authorization server. Mirrors the
 * backend `OAuthGrantType` enum (serialized numerically).
 *
 * Yetkilendirme sunucusu tarafından desteklenen OAuth 2.0 yetkilendirme türleri.
 * Arka uç `OAuthGrantType` enum'unu (sayısal serileştirilen) yansıtır.
 */
export enum OAuthGrantType {
  /**
   * Authorization Code flow with PKCE. For user-facing applications.
   *
   * PKCE ile Yetkilendirme Kodu akışı. Kullanıcıya yönelik uygulamalar için.
   */
  AuthorizationCode = 0,

  /**
   * Client Credentials flow. For machine-to-machine communication.
   *
   * İstemci Kimlik Bilgileri akışı. Makineden makineye iletişim için.
   */
  ClientCredentials = 1,

  /**
   * Refresh Token flow. For obtaining new access tokens without re-authentication.
   *
   * Yenileme Belirteci akışı. Yeniden kimlik doğrulaması olmadan yeni erişim
   * belirteçleri elde etmek için.
   */
  RefreshToken = 2,
}

/**
 * Summary information about an OAuth client, returned when listing clients.
 *
 * Bir OAuth istemcisi hakkında, istemciler listelenirken döndürülen özet bilgi.
 */
export interface GetOAuthClientsResult {
  /**
   * The internal module entity ID of the OAuth client.
   *
   * OAuth istemcisinin dahili modül varlık kimlik numarası.
   */
  readonly id: string;

  /**
   * The OAuth `client_id` used for authentication flows.
   *
   * Kimlik doğrulama akışlarında kullanılan OAuth `client_id`.
   */
  readonly clientId: string;

  /**
   * The human-readable display name of the OAuth client, or `null` when unset.
   *
   * OAuth istemcisinin okunabilir görünen adı veya ayarlanmamışsa `null`.
   */
  readonly displayName: string | null;

  /**
   * The OAuth client type (confidential or public).
   *
   * OAuth istemci türü (gizli veya herkese açık).
   */
  readonly clientType: OAuthClientType;

  /**
   * The API scopes this client can request access to.
   *
   * Bu istemcinin erişim talep edebileceği API kapsamları.
   */
  readonly scopes: string[];

  /**
   * The ISO 8601 timestamp of when the OAuth client was created.
   *
   * OAuth istemcisinin oluşturulduğu ISO 8601 zaman damgası.
   */
  readonly createdAt: string;
}

/**
 * Detailed information about a single OAuth client, including redirect URIs and
 * grant configuration.
 *
 * Yönlendirme URI'leri ve yetkilendirme yapılandırması dahil tek bir OAuth
 * istemcisi hakkında detaylı bilgi.
 */
export interface GetOAuthClientByIdResult {
  /**
   * The internal module entity ID of the OAuth client.
   *
   * OAuth istemcisinin dahili modül varlık kimlik numarası.
   */
  readonly id: string;

  /**
   * The OpenIddict application identifier.
   *
   * OpenIddict uygulama tanımlayıcısı.
   */
  readonly applicationId: string;

  /**
   * The OAuth `client_id` used for authentication flows.
   *
   * Kimlik doğrulama akışlarında kullanılan OAuth `client_id`.
   */
  readonly clientId: string;

  /**
   * The human-readable display name of the OAuth client, or `null` when unset.
   *
   * OAuth istemcisinin okunabilir görünen adı veya ayarlanmamışsa `null`.
   */
  readonly displayName: string | null;

  /**
   * The OAuth client type (confidential or public).
   *
   * OAuth istemci türü (gizli veya herkese açık).
   */
  readonly clientType: OAuthClientType;

  /**
   * The application type that controls redirect URI validation behavior.
   *
   * Yönlendirme URI doğrulama davranışını kontrol eden uygulama türü.
   */
  readonly applicationType: OAuthApplicationType;

  /**
   * The OAuth grant types allowed for this client.
   *
   * Bu istemci için izin verilen OAuth yetkilendirme türleri.
   */
  readonly grantTypes: OAuthGrantType[];

  /**
   * The API scopes this client can request access to.
   *
   * Bu istemcinin erişim talep edebileceği API kapsamları.
   */
  readonly scopes: string[];

  /**
   * The redirect URIs configured for authorization code flow callbacks.
   *
   * Yetkilendirme kodu akışı geri aramaları için yapılandırılan yönlendirme URI'leri.
   */
  readonly redirectUris: string[];

  /**
   * The URIs to redirect to after logout.
   *
   * Oturum kapatıldıktan sonra yönlendirilecek URI'ler.
   */
  readonly postLogoutRedirectUris: string[];

  /**
   * Whether this client must use Pushed Authorization Requests (PAR).
   *
   * Bu istemcinin Pushed Authorization Requests (PAR) kullanmasının zorunlu olup olmadığı.
   */
  readonly requirePushedAuthorizationRequests: boolean;

  /**
   * The ISO 8601 timestamp of when the OAuth client was created.
   *
   * OAuth istemcisinin oluşturulduğu ISO 8601 zaman damgası.
   */
  readonly createdAt: string;
}

/**
 * Request contract for creating a new OAuth client.
 *
 * Yeni bir OAuth istemcisi oluşturmak için istek sözleşmesi.
 */
export interface CreateOAuthClientRequest {
  /**
   * The OAuth `client_id` to assign to the new client.
   *
   * Yeni istemciye atanacak OAuth `client_id`.
   */
  readonly clientId: string;

  /**
   * The client secret for confidential clients. Omit or set to `null` for
   * public clients.
   *
   * Gizli istemciler için istemci sırrı. Herkese açık istemciler için atlayın
   * veya `null` olarak ayarlayın.
   */
  readonly clientSecret?: string | null;

  /**
   * A human-readable display name for the OAuth client.
   *
   * OAuth istemcisi için okunabilir görünen ad.
   */
  readonly displayName?: string | null;

  /**
   * The OAuth client type (confidential or public).
   *
   * OAuth istemci türü (gizli veya herkese açık).
   */
  readonly clientType: OAuthClientType;

  /**
   * The application type that controls redirect URI validation behavior.
   * Defaults to {@link OAuthApplicationType.Web} on the backend when omitted.
   *
   * Yönlendirme URI doğrulama davranışını kontrol eden uygulama türü.
   * Atlandığında arka uçta {@link OAuthApplicationType.Web} varsayılır.
   */
  readonly applicationType?: OAuthApplicationType;

  /**
   * The OAuth grant types allowed for this client.
   *
   * Bu istemci için izin verilen OAuth yetkilendirme türleri.
   */
  readonly grantTypes: OAuthGrantType[];

  /**
   * The API scopes this client can request access to.
   *
   * Bu istemcinin erişim talep edebileceği API kapsamları.
   */
  readonly scopes: string[];

  /**
   * The redirect URIs for authorization code flow callbacks.
   *
   * Yetkilendirme kodu akışı geri aramaları için yönlendirme URI'leri.
   */
  readonly redirectUris?: string[];

  /**
   * The URIs to redirect to after logout.
   *
   * Oturum kapatıldıktan sonra yönlendirilecek URI'ler.
   */
  readonly postLogoutRedirectUris?: string[];

  /**
   * Whether this client must use Pushed Authorization Requests (PAR).
   *
   * Bu istemcinin Pushed Authorization Requests (PAR) kullanmasının zorunlu olup olmadığı.
   */
  readonly requirePushedAuthorizationRequests?: boolean;
}

/**
 * Response contract returned after successfully creating an OAuth client.
 *
 * Bir OAuth istemcisi başarıyla oluşturulduktan sonra döndürülen yanıt sözleşmesi.
 */
export interface CreateOAuthClientResult {
  /**
   * The internal module entity ID assigned to the new OAuth client.
   *
   * Yeni OAuth istemcisine atanan dahili modül varlık kimlik numarası.
   */
  readonly id: string;

  /**
   * The OpenIddict application identifier of the new OAuth client.
   *
   * Yeni OAuth istemcisinin OpenIddict uygulama tanımlayıcısı.
   */
  readonly applicationId: string;

  /**
   * The OAuth `client_id` of the new OAuth client.
   *
   * Yeni OAuth istemcisinin OAuth `client_id`'si.
   */
  readonly clientId: string;
}

/**
 * Request contract for updating an existing OAuth client. Only the fields
 * provided are applied; omitted fields are left unchanged on the backend,
 * so callers can update redirect URIs without clobbering other settings.
 *
 * Mevcut bir OAuth istemcisini güncellemek için istek sözleşmesi. Yalnızca
 * sağlanan alanlar uygulanır; atlanan alanlar arka uçta değiştirilmeden bırakılır,
 * böylece çağıranlar diğer ayarları bozmadan yönlendirme URI'lerini güncelleyebilir.
 */
export interface UpdateOAuthClientRequest {
  /**
   * The internal module entity ID of the OAuth client to update.
   *
   * Güncellenecek OAuth istemcisinin dahili modül varlık kimlik numarası.
   */
  readonly id: string;

  /**
   * Updated human-readable display name for the OAuth client.
   *
   * OAuth istemcisi için güncellenmiş okunabilir görünen ad.
   */
  readonly displayName?: string | null;

  /**
   * Updated API scopes this client can request access to.
   *
   * Bu istemcinin erişim talep edebileceği güncellenmiş API kapsamları.
   */
  readonly scopes?: string[] | null;

  /**
   * Updated redirect URIs for authorization code flow callbacks.
   *
   * Yetkilendirme kodu akışı geri aramaları için güncellenmiş yönlendirme URI'leri.
   */
  readonly redirectUris?: string[] | null;

  /**
   * Updated URIs to redirect to after logout.
   *
   * Oturum kapatıldıktan sonra yönlendirilecek güncellenmiş URI'ler.
   */
  readonly postLogoutRedirectUris?: string[] | null;

  /**
   * Updated setting for whether this client must use Pushed Authorization
   * Requests (PAR).
   *
   * Bu istemcinin Pushed Authorization Requests (PAR) kullanmasının zorunlu olup
   * olmadığına dair güncellenmiş ayar.
   */
  readonly requirePushedAuthorizationRequests?: boolean | null;
}
