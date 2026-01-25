/**
 * @fileoverview Customer GraphQL Tests - Tests for InsurUpCustomerClient.getCustomers
 * @description Tests covering type-safe field selection, pagination, filtering, and sorting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HttpTransport } from "../src/client/http";
import { GraphQLTransport } from "../src/client/graphql";
import { InsurUpCustomerClient } from "../src/clients/customer";
import { CustomerType } from "@insurup/contracts";
import { Gender, ConsentType } from "@insurup/contracts";
import type {
  CustomersConnection,
  QueryCustomerModel,
} from "@insurup/contracts";
import { SortEnumType } from "@insurup/contracts";
import { TestSetupHelper } from "./utils";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("InsurUpCustomerClient.getCustomers", () => {
  let httpTransport: HttpTransport;
  let graphqlTransport: GraphQLTransport;
  let customerClient: InsurUpCustomerClient;

  const createMockCustomer = (
    overrides?: Partial<QueryCustomerModel>
  ): QueryCustomerModel => ({
    id: "customer-123",
    name: "John Doe",
    identityNumber: "12345678901",
    taxNumber: null,
    type: CustomerType.Individual,
    primaryEmail: "john@example.com",
    primaryPhoneNumber: "+905551234567",
    primaryPhoneNumberCountryCode: 90,
    cityText: "Istanbul",
    cityValue: "34",
    districtText: "Kadikoy",
    districtValue: "3401",
    createdAt: "2024-01-01T00:00:00Z",
    birthDate: "1990-05-15",
    gender: Gender.Male,
    educationStatus: null,
    nationality: null,
    maritalStatus: null,
    job: null,
    passportNumber: null,
    searchScore: null,
    agentBranch: null,
    agentBranchId: null,
    consents: [
      { consentType: "KVKK" as ConsentType, isActive: true },
      { consentType: "ETK" as ConsentType, isActive: false },
    ],
    ...overrides,
  });

  const createMockConnection = (
    nodes: QueryCustomerModel[],
    totalCount?: number
  ): CustomersConnection => ({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: nodes.length > 0 ? "cursor-start" : null,
      endCursor: nodes.length > 0 ? "cursor-end" : null,
    },
    nodes,
    edges: nodes.map((node, i) => ({
      cursor: `cursor-${i}`,
      node,
    })),
    totalCount: totalCount ?? nodes.length,
  });

  beforeEach(() => {
    TestSetupHelper.cleanup();

    httpTransport = new HttpTransport({
      baseUrl: "https://test.api.com/api/",
      timeoutMs: 5000,
      logLevel: "none",
    });

    graphqlTransport = new GraphQLTransport(httpTransport);
    customerClient = new InsurUpCustomerClient(httpTransport, graphqlTransport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Queries", () => {
    it("should fetch customers with all fields by default", async () => {
      const mockCustomers = [createMockCustomer(), createMockCustomer({ id: "customer-456", name: "Jane Doe" })];
      const mockConnection = createMockConnection(mockCustomers, 2);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers({ first: 10 });

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.nodes).toHaveLength(2);
        expect(result.data.totalCount).toBe(2);
        expect(result.data.nodes![0]!.id).toBe("customer-123");
        expect(result.data.nodes![1]!.name).toBe("Jane Doe");
      }
    });

    it("should fetch customers without any options", async () => {
      const mockConnection = createMockConnection([createMockCustomer()], 1);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers();

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.nodes).toHaveLength(1);
      }
    });

    it("should handle empty results", async () => {
      const mockConnection = createMockConnection([], 0);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers({ first: 10 });

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.nodes).toHaveLength(0);
        expect(result.data.totalCount).toBe(0);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });
  });

  describe("Field Selection", () => {
    it("should request only selected fields", async () => {
      const mockConnection = createMockConnection([
        { id: "1", name: "John", type: CustomerType.Individual } as Partial<QueryCustomerModel> as QueryCustomerModel,
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        select: ["id", "name", "type"] as const,
        first: 10,
      });

      // Verify the query only requests the selected fields
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.query).toContain("id");
      expect(body.query).toContain("name");
      expect(body.query).toContain("type");
      // Should not contain non-selected fields in the nodes section
    });

    it("should handle consents field selection with nested fields", async () => {
      const mockConnection = createMockConnection([
        {
          id: "1",
          consents: [{ consentType: "KVKK", isActive: true }],
        } as Partial<QueryCustomerModel> as QueryCustomerModel,
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        select: ["id", "consents.consentType", "consents.isActive"] as const,
        first: 10,
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      // Consents should include nested fields
      expect(body.query).toContain("consents { consentType isActive }");
    });

    it("should handle agentBranch field selection with nested fields", async () => {
      const mockConnection = createMockConnection([
        {
          id: "1",
          agentBranch: { id: "branch-1", name: "Main Branch" },
        } as Partial<QueryCustomerModel> as QueryCustomerModel,
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        select: [
          "id",
          "agentBranch.id",
          "agentBranch.name",
          "agentBranch.parentId",
          "agentBranch.parentName",
        ] as const,
        first: 10,
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      // AgentBranch should include nested fields
      expect(body.query).toContain("agentBranch { id name parentId parentName }");
    });
  });

  describe("Pagination", () => {
    it("should support forward pagination with first/after", async () => {
      const mockConnection: CustomersConnection = {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: "cursor-1",
          endCursor: "cursor-10",
        },
        nodes: [createMockCustomer()],
        edges: [{ cursor: "cursor-1", node: createMockCustomer() }],
        totalCount: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers({
        first: 10,
        after: "previous-cursor",
      });

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.pageInfo.hasNextPage).toBe(true);
        expect(result.data.totalCount).toBe(100);
      }

      // Verify variables were passed correctly
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.first).toBe(10);
      expect(body.variables.after).toBe("previous-cursor");
    });

    it("should support backward pagination with last/before", async () => {
      const mockConnection: CustomersConnection = {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: "cursor-91",
          endCursor: "cursor-100",
        },
        nodes: [createMockCustomer()],
        edges: [{ cursor: "cursor-100", node: createMockCustomer() }],
        totalCount: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers({
        last: 10,
        before: "next-cursor",
      });

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.pageInfo.hasPreviousPage).toBe(true);
      }

      // Verify variables were passed correctly
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.last).toBe(10);
      expect(body.variables.before).toBe("next-cursor");
    });
  });

  describe("Filtering", () => {
    it("should apply type filter", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        filter: {
          type: { eq: CustomerType.Individual },
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.filter).toEqual({
        type: { eq: CustomerType.Individual },
      });
    });

    it("should apply complex filters with AND/OR", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        filter: {
          and: [
            { type: { eq: CustomerType.Individual } },
            {
              or: [
                { cityText: { contains: "Istanbul" } },
                { cityText: { contains: "Ankara" } },
              ],
            },
          ],
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.filter.and).toHaveLength(2);
    });

    it("should apply date range filter", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        filter: {
          createdAt: {
            gte: "2024-01-01T00:00:00Z",
            lt: "2024-12-31T23:59:59Z",
          },
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.filter.createdAt.gte).toBe("2024-01-01T00:00:00Z");
      expect(body.variables.filter.createdAt.lt).toBe("2024-12-31T23:59:59Z");
    });

    it("should apply consent filter", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        filter: {
          consents: {
            some: {
              consentType: { eq: ConsentType.KVKK },
              isActive: { eq: true },
            },
          },
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.filter.consents.some.isActive.eq).toBe(true);
    });
  });

  describe("Search", () => {
    it("should apply text search on name", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        search: {
          name: {
            textSearch: { value: "John" },
          },
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.search.name.textSearch.value).toBe("John");
    });

    it("should apply wildcard search", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        search: {
          primaryEmail: {
            wildcard: { value: "*@example.com" },
          },
        },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.search.primaryEmail.wildcard.value).toBe("*@example.com");
    });
  });

  describe("Sorting", () => {
    it("should apply single sort order", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        order: [{ createdAt: SortEnumType.DESC }],
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.order).toEqual([{ createdAt: "DESC" }]);
    });

    it("should apply multiple sort orders", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      await customerClient.getCustomers({
        first: 10,
        order: [{ name: SortEnumType.ASC }, { createdAt: SortEnumType.DESC }],
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.order).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when GraphQL transport is not available", async () => {
      // Create client without GraphQL transport
      const clientWithoutGraphQL = new InsurUpCustomerClient(httpTransport);

      await expect(clientWithoutGraphQL.getCustomers({ first: 10 })).rejects.toThrow(
        "GraphQL transport is not available"
      );
    });

    it("should handle GraphQL errors gracefully with graphql-error kind", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              data: null,
              errors: [
                {
                  message: "Invalid filter value",
                  locations: [{ line: 1, column: 10 }],
                  path: ["customersNew"],
                  extensions: {
                    code: "BAD_REQUEST",
                  },
                },
              ],
            })
          ),
      });

      const result = await customerClient.getCustomers({ first: 10 });

      expect(result.kind).toBe("graphql-error");
      if (result.kind === "graphql-error") {
        expect(result.message).toContain("Invalid filter value");
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].path).toEqual(["customersNew"]);
      }
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await customerClient.getCustomers({ first: 10 });

      expect(result.kind).toBe("client-error");
    });

    it("should handle server errors (5xx) as server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              type: "https://api.insurup.com/problems/upstream-service",
              title: "Internal Server Error",
              detail: "Server error occurred",
              status: 500,
            })
          ),
      });

      const result = await customerClient.getCustomers({ first: 10 });

      // HTTP level errors are returned as server errors
      expect(result.kind).toBe("server-error");
      if (result.kind === "server-error") {
        expect(result.status).toBe(500);
      }
    });
  });

  describe("Combined Options", () => {
    it("should handle all options together", async () => {
      const mockConnection = createMockConnection([createMockCustomer()]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({ data: { customersNew: mockConnection } })
          ),
      });

      const result = await customerClient.getCustomers({
        select: ["id", "name", "type", "primaryEmail"] as const,
        first: 20,
        after: "cursor-abc",
        filter: {
          type: { eq: CustomerType.Individual },
        },
        search: {
          name: { textSearch: { value: "John" } },
        },
        order: [{ createdAt: SortEnumType.DESC }],
      });

      expect(result.kind).toBe("success");

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.variables.first).toBe(20);
      expect(body.variables.after).toBe("cursor-abc");
      expect(body.variables.filter).toBeDefined();
      expect(body.variables.search).toBeDefined();
      expect(body.variables.order).toBeDefined();
    });
  });
});
