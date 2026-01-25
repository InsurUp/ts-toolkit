/**
 * @fileoverview Agent Branch Contracts - Agent branch management operations
 * @description TypeScript contracts for agent branch management operations
 */

/**
 * Request to create a new agent branch
 */
export interface CreateAgentBranchRequest {
  readonly name: string;
  readonly parentBranchId?: string;
}

/**
 * Request to update an existing agent branch
 */
export interface UpdateAgentBranchRequest {
  readonly id: string;
  readonly name: string;
  readonly parentBranchId?: string;
}

/**
 * Request to delete an agent branch
 */
export interface DeleteAgentBranchRequest {
  readonly id: string;
}

/**
 * Response containing agent branch details
 */
export interface GetAgentBranchResult {
  readonly id: string;
  readonly name: string;
  readonly parentBranchId?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

/**
 * Response containing all agent branches
 */
export interface GetAllAgentBranchesResult {
  readonly id: string;
  readonly name: string;
  readonly parentBranchId?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}
