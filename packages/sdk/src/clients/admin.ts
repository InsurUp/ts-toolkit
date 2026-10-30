/**
 * @fileoverview Admin Client - Admin panel operations, grouped by area
 * @description Every endpoint the admin panel's user type can call, split into the same areas as the admin MCP
 */

import type { HttpTransport } from '../client/http.js';
import { InsurUpAdminAgentSetupClient } from './admin/agentSetup.js';
import { InsurUpAdminAgentsClient } from './admin/agents.js';
import { InsurUpAdminAgentUsersClient } from './admin/agentUsers.js';
import { InsurUpAdminAlertsClient } from './admin/alerts.js';
import { InsurUpAdminCacheClient } from './admin/cache.js';
import { InsurUpAdminErrorsClient } from './admin/errors.js';
import { InsurUpAdminInsightsClient } from './admin/insights.js';
import { InsurUpAdminInsuranceCompaniesClient } from './admin/insuranceCompanies.js';
import { InsurUpAdminInsurGatewayClient } from './admin/insurGateway.js';
import { InsurUpAdminInvestigationsClient } from './admin/investigations.js';
import { InsurUpAdminInvitesClient } from './admin/invites.js';
import { InsurUpAdminMessagesClient } from './admin/messages.js';
import { InsurUpAdminObservabilityClient } from './admin/observability.js';
import { InsurUpAdminProductsClient } from './admin/products.js';
import { InsurUpAdminReleaseNotesClient } from './admin/releaseNotes.js';
import { InsurUpAdminResourceKeysClient } from './admin/resourceKeys.js';
import { InsurUpAdminRolesClient } from './admin/roles.js';
import { InsurUpAdminRoutingRulesClient } from './admin/routingRules.js';
import { InsurUpAdminSubscriptionPlansClient } from './admin/subscriptionPlans.js';
import { InsurUpAdminUsersClient } from './admin/users.js';

/**
 * Admin panel operations. Every call needs an admin panel user's token; create the client with
 * `userType: UserType.AdminPanel` so a person who also belongs to an agency acts as the admin panel user.
 *
 * Admin panel işlemleri. Her çağrı bir admin panel kullanıcısının token'ını gerektirir; bir acenteye de üye
 * olan kişinin admin panel kullanıcısı olarak işlem yapması için istemciyi `userType: UserType.AdminPanel`
 * ile oluşturun.
 */
export class InsurUpAdminClient {
  /** Admin panel users: invitations, profiles, deactivation, migration and passwords. */
  public readonly users: InsurUpAdminUsersClient;

  /** Admin panel roles and their permissions. */
  public readonly roles: InsurUpAdminRolesClient;

  /** The signed-in person's admin panel invitations and membership. */
  public readonly invites: InsurUpAdminInvitesClient;

  /** Agencies: listing, activation, subscriptions and billing. */
  public readonly agents: InsurUpAdminAgentsClient;

  /** Agency users across agencies. */
  public readonly agentUsers: InsurUpAdminAgentUsersClient;

  /** Subscription plans. */
  public readonly subscriptionPlans: InsurUpAdminSubscriptionPlansClient;

  /** Agency setup requests. */
  public readonly agentSetup: InsurUpAdminAgentSetupClient;

  /** The catalogue's insurance products: adding, renaming, enablement, sync, installment options and proposal conditions. */
  public readonly products: InsurUpAdminProductsClient;

  /** The catalogue's insurance companies and their connection fields. */
  public readonly insuranceCompanies: InsurUpAdminInsuranceCompaniesClient;

  /** The routing rules that pick each operation's insurance service provider. */
  public readonly routingRules: InsurUpAdminRoutingRulesClient;

  /** Which of InsurGateway's products and companies each catalogue product and company is. */
  public readonly insurGateway: InsurUpAdminInsurGatewayClient;

  /** Resource keys (localized texts). */
  public readonly resourceKeys: InsurUpAdminResourceKeysClient;

  /** Release notes. */
  public readonly releaseNotes: InsurUpAdminReleaseNotesClient;

  /** The platform cache. */
  public readonly cache: InsurUpAdminCacheClient;

  /** Logs, metrics, traces, InsurGateway calls and database statistics. */
  public readonly observability: InsurUpAdminObservabilityClient;

  /** Alert rules, notification channels, silences and alert history. */
  public readonly alerts: InsurUpAdminAlertsClient;

  /** The platform's errors grouped by fingerprint, their triage, and whether new ones are investigated. */
  public readonly errors: InsurUpAdminErrorsClient;

  /** The AI's investigations of alerts, errors and parked queues. */
  public readonly investigations: InsurUpAdminInvestigationsClient;

  /** The RabbitMQ queues, a peek at their messages, and the replay, purge and investigation of parked ones. */
  public readonly messages: InsurUpAdminMessagesClient;

  /** Business insights: overview, agencies, features, sales, channels, operations and assistant usage. */
  public readonly insights: InsurUpAdminInsightsClient;

  constructor(http: HttpTransport) {
    this.users = new InsurUpAdminUsersClient(http);
    this.roles = new InsurUpAdminRolesClient(http);
    this.invites = new InsurUpAdminInvitesClient(http);
    this.agents = new InsurUpAdminAgentsClient(http);
    this.agentUsers = new InsurUpAdminAgentUsersClient(http);
    this.subscriptionPlans = new InsurUpAdminSubscriptionPlansClient(http);
    this.agentSetup = new InsurUpAdminAgentSetupClient(http);
    this.products = new InsurUpAdminProductsClient(http);
    this.insuranceCompanies = new InsurUpAdminInsuranceCompaniesClient(http);
    this.routingRules = new InsurUpAdminRoutingRulesClient(http);
    this.insurGateway = new InsurUpAdminInsurGatewayClient(http);
    this.resourceKeys = new InsurUpAdminResourceKeysClient(http);
    this.releaseNotes = new InsurUpAdminReleaseNotesClient(http);
    this.cache = new InsurUpAdminCacheClient(http);
    this.observability = new InsurUpAdminObservabilityClient(http);
    this.alerts = new InsurUpAdminAlertsClient(http);
    this.errors = new InsurUpAdminErrorsClient(http);
    this.investigations = new InsurUpAdminInvestigationsClient(http);
    this.messages = new InsurUpAdminMessagesClient(http);
    this.insights = new InsurUpAdminInsightsClient(http);
  }
}
