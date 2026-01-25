/**
 * @fileoverview Default InsurUp Client - Main SDK client implementation
 * @description Main SDK client implementation
 */

import { HttpTransport } from "./http.js";
import { GraphQLTransport } from "./graphql.js";
import type { InsurUpClientOptions } from "../core/options.js";

// Import specialized clients
import { InsurUpAgentClient } from "../clients/agent.js";
import { InsurUpAgentBranchClient } from "../clients/agentBranch.js";
import { InsurUpAgentRoleClient } from "../clients/agentRole.js";
import { InsurUpAgentSetupClient } from "../clients/agentSetup.js";
import { InsurUpAgentUserClient } from "../clients/agentUser.js";
import { InsurUpCustomerClient } from "../clients/customer.js";
import { InsurUpVehicleClient } from "../clients/vehicle.js";
import { InsurUpPropertyClient } from "../clients/property.js";
import { InsurUpPolicyClient } from "../clients/policy.js";
import { InsurUpCaseClient } from "../clients/case.js";
import { InsurUpWebhookClient } from "../clients/webhook.js";
import { InsurUpCoverageClient } from "../clients/coverage.js";
import { InsurUpInsuranceClient } from "../clients/insurance.js";
import { InsurUpProposalClient } from "../clients/proposal.js";
import { InsurUpFileClient } from "../clients/file.js";
import { InsurUpLanguageClient } from "../clients/language.js";
import { InsurUpTemplateClient } from "../clients/template.js";

/**
 * Main unified client providing comprehensive access to all InsurUp platform operations.
 * Aggregates specialized client interfaces for authentication, agent management, customer operations,
 * vehicle and property insurance, coverage management, and policy administration.
 */
export class DefaultInsurUpClient {
  private readonly http: HttpTransport;
  private readonly graphql: GraphQLTransport;

  /**
   * Agent Management Client
   *
   * Provides agent management operations for handling agent profiles, insurance company connections,
   * and business relationships within the insurance ecosystem.
   */
  public readonly agents: InsurUpAgentClient;

  /**
   * Agent Branch Management Client
   *
   * Provides branch management operations for insurance agents, enabling the creation and administration
   * of organizational branches within agency structures.
   */
  public readonly agentBranches: InsurUpAgentBranchClient;

  /**
   * Agent Role Management Client
   *
   * Provides role management operations for insurance agents, enabling the creation and administration
   * of role-based access control within agency hierarchies and permission structures.
   */
  public readonly agentRoles: InsurUpAgentRoleClient;

  /**
   * Agent Setup Client
   *
   * Provides agent onboarding and setup operations for new insurance agents joining the InsurUp platform,
   * facilitating the complete registration and configuration process required for business operations.
   */
  public readonly agentSetup: InsurUpAgentSetupClient;

  /**
   * Agent User Management Client
   *
   * Provides comprehensive user management operations for insurance agency staff, enabling agencies to manage
   * their team members, permissions, and access control within the InsurUp platform ecosystem.
   */
  public readonly agentUsers: InsurUpAgentUserClient;

  /**
   * Customer Management Client
   *
   * Provides comprehensive customer management operations for handling customer profiles, contact information,
   * health data, communication flows, and external customer data integration.
   */
  public readonly customers: InsurUpCustomerClient;

  /**
   * Vehicle Management Client
   *
   * Provides comprehensive vehicle management operations for handling customer vehicles, vehicle data lookups,
   * brand and model queries, and vehicle-based insurance operations within the automotive insurance ecosystem.
   */
  public readonly vehicles: InsurUpVehicleClient;

  /**
   * Property Management Client
   *
   * Provides comprehensive property management operations for handling customer properties, Turkish address hierarchy queries,
   * DASK earthquake insurance lookups, and property-based insurance operations within the real estate insurance ecosystem.
   */
  public readonly properties: InsurUpPropertyClient;

  /**
   * Policy Management Client
   *
   * Provides comprehensive policy management operations for handling insurance policies, policy documents,
   * representative assignments, and policy administration.
   */
  public readonly policies: InsurUpPolicyClient;

  /**
   * Case Management Client
   *
   * Provides comprehensive case management operations for handling customer service requests, claims processing,
   * sales opportunities, and complaint resolution within the insurance workflow.
   */
  public readonly cases: InsurUpCaseClient;

  /**
   * Webhook Management Client
   *
   * Provides comprehensive webhook management operations for configuring event notifications, monitoring delivery status,
   * and managing external system integrations within the InsurUp platform ecosystem.
   */
  public readonly webhooks: InsurUpWebhookClient;

  /**
   * Coverage Management Client
   *
   * Provides coverage management operations for configuring insurance product coverages, managing coverage groups,
   * and retrieving available coverage options for different insurance branches within the InsurUp platform.
   */
  public readonly coverage: InsurUpCoverageClient;

  /**
   * Insurance Industry Data Client
   *
   * Provides comprehensive insurance industry data access for retrieving insurance companies, products, resource keys,
   * release notes, and financial institution information essential for platform operations and integrations.
   */
  public readonly insurance: InsurUpInsuranceClient;

  /**
   * Proposal Management Client
   *
   * Provides comprehensive proposal management operations for creating insurance proposals, managing proposal lifecycle,
   * document generation, product purchasing, and comparison tools within the insurance sales process.
   */
  public readonly proposals: InsurUpProposalClient;

  /**
   * File Management Client
   *
   * Provides file management operations for the InsurUp platform, enabling agents to upload and manage files
   * within the insurance ecosystem.
   */
  public readonly files: InsurUpFileClient;

  /**
   * Language Management Client
   *
   * Provides language and localization operations for retrieving available languages in the InsurUp platform.
   * Essential for multi-language support and internationalization features.
   */
  public readonly languages: InsurUpLanguageClient;

  /**
   * Template Management Client
   *
   * Provides template management operations for the InsurUp platform, enabling agents to retrieve and update
   * document templates, email templates, and other content templates used in insurance workflows.
   */
  public readonly templates: InsurUpTemplateClient;

  public readonly options: InsurUpClientOptions;

  constructor(options?: InsurUpClientOptions) {
    this.http = new HttpTransport(options);
    this.graphql = new GraphQLTransport(this.http);
    this.options = options || {};

    // Initialize all specialized clients
    this.agents = new InsurUpAgentClient(this.http);
    this.agentBranches = new InsurUpAgentBranchClient(this.http);
    this.agentRoles = new InsurUpAgentRoleClient(this.http);
    this.agentSetup = new InsurUpAgentSetupClient(this.http);
    this.agentUsers = new InsurUpAgentUserClient(this.http, this.graphql);
    this.customers = new InsurUpCustomerClient(this.http, this.graphql);
    this.vehicles = new InsurUpVehicleClient(this.http);
    this.properties = new InsurUpPropertyClient(this.http);
    this.policies = new InsurUpPolicyClient(this.http, this.graphql);
    this.cases = new InsurUpCaseClient(this.http, this.graphql);
    this.webhooks = new InsurUpWebhookClient(this.http, this.graphql);
    this.coverage = new InsurUpCoverageClient(this.http);
    this.insurance = new InsurUpInsuranceClient(this.http);
    this.proposals = new InsurUpProposalClient(this.http, this.graphql);
    this.files = new InsurUpFileClient(this.http);
    this.languages = new InsurUpLanguageClient(this.http);
    this.templates = new InsurUpTemplateClient(this.http);
  }
}
