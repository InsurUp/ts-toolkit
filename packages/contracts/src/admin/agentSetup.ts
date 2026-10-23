/**
 * @fileoverview Admin agent setup contracts - Agency setup requests (onboarding invites)
 * @description Request/result types of the admin `agent-setup-requests` endpoints: creating, listing,
 * reading and disabling the invites a new agency completes to get its account
 */

/**
 * Whether an agency pays before it is provisioned.
 *
 * Bir acentenin oluşturulmadan önce ödeme yapıp yapmadığı.
 */
export enum AgentSetupPaymentMode {
  /** The administrator presets a locked subscription; no payment is collected (manual billing). */
  None = 'NONE',
  /** The agency chooses the plan and counts and pays before provisioning (automatic billing). */
  Required = 'REQUIRED',
}

/**
 * Lifecycle state of an agent setup request.
 *
 * Bir acente kurulum talebinin yaşam döngüsü durumu.
 */
export enum AgentSetupRequestState {
  /** Open: the invite can still be completed. */
  Active = 'ACTIVE',
  /** Completed: the agency was created. */
  Done = 'DONE',
  /** Disabled by an administrator. */
  Inactive = 'INACTIVE',
}

/**
 * Creates an agent setup request: a single-use invite e-mailed to the agency, valid for `expiration`.
 *
 * Bir acente kurulum talebi oluşturur: acenteye e-postayla gönderilen, `expiration` süresince geçerli tek
 * kullanımlık davet.
 */
export interface CreateAgentSetupRequestRequest {
  /** Label identifying the request in the admin panel. */
  readonly label: string;
  /** How long the invite stays valid, as a .NET TimeSpan string `[d.]hh:mm:ss` (e.g. `7.00:00:00`). */
  readonly expiration: string;
  /** E-mail address the setup link is sent to. */
  readonly email: string;
  /**
   * Plan to assign. Required (and locked) when `paymentMode` is `NONE`; an optional default the agency may
   * change when it is `REQUIRED`.
   */
  readonly subscriptionPlanId?: number | null;
  /** User-seat override; null or omitted uses the plan default. */
  readonly userLimit?: number | null;
  /** Insurance-company override; null or omitted uses the plan default. */
  readonly insuranceCompanyLimit?: number | null;
  /** Whether the agency pays before provisioning; defaults to `NONE`. */
  readonly paymentMode?: AgentSetupPaymentMode;
}

/**
 * The created agent setup request: its id, the single-use invite code and the setup link.
 *
 * Oluşturulan acente kurulum talebi: kimliği, tek kullanımlık davet kodu ve kurulum bağlantısı.
 */
export interface CreateAgentSetupRequestResult {
  /** Setup request id. */
  readonly id: string;
  /** Single-use invite code. */
  readonly code: string;
  /** The invite code URL-encoded for a query string. */
  readonly urlEncodedCode: string;
  /** Absolute public setup URL with the code embedded; also e-mailed to the agency. */
  readonly url: string;
}

/**
 * One agent setup request's details.
 *
 * Bir acente kurulum talebinin ayrıntıları.
 */
export interface GetAgentSetupRequestByIdResult {
  /** Setup request id. */
  readonly id: string;
  /** Label identifying the request. */
  readonly label: string;
  /** Lifecycle state. */
  readonly state: AgentSetupRequestState;
  /** When the request was created (ISO-8601). */
  readonly creationDate: string;
  /** When the invite expires (ISO-8601). */
  readonly expirationTime: string;
}

/**
 * Paging of `GET agent-setup-requests` (1-based page).
 *
 * `GET agent-setup-requests` sayfalaması (1 tabanlı sayfa).
 */
export interface GetAllAgentSetupRequestsRequest {
  /** 1-based page number; defaults to 1. */
  readonly page?: number;
  /** Page size (1–100); defaults to 10. */
  readonly pageSize?: number;
}

/**
 * One agent setup request of the list.
 *
 * Listedeki bir acente kurulum talebi.
 */
export interface GetAllAgentSetupRequestsResultItem {
  /** Setup request id. */
  readonly id: string;
  /** Label identifying the request. */
  readonly label: string;
  /** Lifecycle state. */
  readonly state: AgentSetupRequestState;
  /** How long the invite was valid for, as a .NET TimeSpan string `[d.]hh:mm:ss`. */
  readonly expirationTimeSpan: string;
  /** When the request was created (ISO-8601). */
  readonly creationDate: string;
  /** Id of the created agency; null until the request is completed. */
  readonly createdAgentId: string | null;
  /** Id of the created agent user; null until the request is completed. */
  readonly createdAgentUserId: string | null;
  /** When the invite expires (ISO-8601). */
  readonly expirationTime: string;
  /** Whether the invite has expired. */
  readonly isExpired: boolean;
  /** Id of the admin panel user who created the request. */
  readonly createdByAdminPanelUserId: string;
  /** Single-use invite code. */
  readonly code: string;
  /** E-mail address the setup link was sent to. */
  readonly email: string;
  /** Assigned subscription plan id. */
  readonly subscriptionPlanId: number;
  /** User-seat override; null when the plan default applies. */
  readonly userLimit: number | null;
  /** Insurance-company override; null when the plan default applies. */
  readonly insuranceCompanyLimit: number | null;
  /** Absolute setup URL for the agency. */
  readonly setupUrl: string;
}

/**
 * A page of agent setup requests, newest first.
 *
 * Acente kurulum taleplerinin bir sayfası, en yeni önce.
 */
export interface GetAllAgentSetupRequestsResult {
  /** The requests on this page. */
  readonly items: readonly GetAllAgentSetupRequestsResultItem[];
  /** Total number of requests. */
  readonly totalCount: number;
  /** 1-based page number. */
  readonly page: number;
  /** Page size. */
  readonly pageSize: number;
  /** Total number of pages. */
  readonly totalPages: number;
  /** Whether a next page exists. */
  readonly hasNextPage: boolean;
  /** Whether a previous page exists. */
  readonly hasPreviousPage: boolean;
}
