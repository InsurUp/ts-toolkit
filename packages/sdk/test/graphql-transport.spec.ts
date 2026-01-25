/**
 * @fileoverview GraphQL Transport Tests - Comprehensive tests for GraphQLTransport class
 * @description Tests covering GraphQL query execution, error handling, and type safety
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HttpTransport } from "../src/client/http";
import { GraphQLTransport } from "../src/client/graphql";
import {
  InsurUpClientErrorType,
  InsurUpGraphQLErrorCode,
} from "../src/core/result";
import { TestSetupHelper } from "./utils";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("GraphQLTransport", () => {
  let httpTransport: HttpTransport;
  let graphqlTransport: GraphQLTransport;

  beforeEach(() => {
    TestSetupHelper.cleanup();

    httpTransport = new HttpTransport({
      baseUrl: "https://test.api.com/api/",
      timeoutMs: 5000,
      logLevel: "none",
    });

    graphqlTransport = new GraphQLTransport(httpTransport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Successful Queries", () => {
    it("should execute a simple query and return data", async () => {
      const mockData = {
        customersNew: {
          nodes: [{ id: "1", name: "John Doe" }],
          totalCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: mockData })),
      });

      const result = await graphqlTransport.query<typeof mockData>(
        "query { customersNew { nodes { id name } totalCount } }"
      );

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data).toEqual(mockData);
        expect(result.data.customersNew.nodes[0].id).toBe("1");
        expect(result.data.customersNew.totalCount).toBe(1);
      }
    });

    it("should pass variables correctly", async () => {
      const mockData = {
        customersNew: {
          nodes: [{ id: "1", name: "Jane Doe" }],
          totalCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: mockData })),
      });

      const query = `
        query GetCustomers($first: Int) {
          customersNew(first: $first) {
            nodes { id name }
            totalCount
          }
        }
      `;

      const variables = { first: 10 };

      await graphqlTransport.query<typeof mockData>(query, variables);

      // Verify the request was made with correct body
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.api.com/api/graphql",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"variables":{"first":10}'),
        })
      );
    });

    it("should handle queries with complex nested data", async () => {
      const mockData = {
        customersNew: {
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: "cursor1",
            endCursor: "cursor2",
          },
          nodes: [
            {
              id: "1",
              name: "John Doe",
              consents: [
                { consentType: "KVKK", isActive: true },
                { consentType: "ETK", isActive: false },
              ],
            },
          ],
          edges: [
            {
              cursor: "edge1",
              node: { id: "1", name: "John Doe" },
            },
          ],
          totalCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: mockData })),
      });

      const result = await graphqlTransport.query<typeof mockData>(
        "query { customersNew { pageInfo { hasNextPage } nodes { id name consents { consentType isActive } } } }"
      );

      expect(result.kind).toBe("success");
      if (result.kind === "success") {
        expect(result.data.customersNew.pageInfo.hasNextPage).toBe(true);
        expect(result.data.customersNew.nodes[0].consents).toHaveLength(2);
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle GraphQL errors in response with graphql-error kind", async () => {
      const errorResponse = {
        data: null,
        errors: [
          {
            message: "Field 'unknownField' not found on type 'QueryCustomerModel'",
            locations: [{ line: 1, column: 40 }],
            path: ["customersNew", "nodes"],
            extensions: {
              code: "VALIDATION_ERROR",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      });

      const result = await graphqlTransport.query(
        "query { customersNew { nodes { unknownField } } }"
      );

      expect(result.kind).toBe("graphql-error");
      if (result.kind === "graphql-error") {
        expect(result.message).toContain("Field 'unknownField' not found");
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].locations).toEqual([{ line: 1, column: 40 }]);
        expect(result.errors[0].path).toEqual(["customersNew", "nodes"]);
        expect(result.errors[0].extensions?.code).toBe(
          InsurUpGraphQLErrorCode.ValidationError
        );
      }
    });

    it("should handle multiple GraphQL errors", async () => {
      const errorResponse = {
        data: null,
        errors: [
          {
            message: "Error 1",
            locations: [{ line: 1, column: 10 }],
            extensions: { code: "BAD_REQUEST" },
          },
          {
            message: "Error 2",
            locations: [{ line: 2, column: 20 }],
            extensions: { code: "FORBIDDEN" },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      });

      const result = await graphqlTransport.query("query { bad }");

      expect(result.kind).toBe("graphql-error");
      if (result.kind === "graphql-error") {
        // Should report the first error message
        expect(result.message).toBe("Error 1");
        // All errors should be available in the errors array
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].message).toBe("Error 1");
        expect(result.errors[0].extensions?.code).toBe(
          InsurUpGraphQLErrorCode.BadRequest
        );
        expect(result.errors[1].message).toBe("Error 2");
        expect(result.errors[1].extensions?.code).toBe(
          InsurUpGraphQLErrorCode.Forbidden
        );
      }
    });

    it("should handle GraphQL errors with full extensions", async () => {
      const errorResponse = {
        data: null,
        errors: [
          {
            message: "Customer not found",
            locations: [{ line: 1, column: 5 }],
            path: ["customer"],
            extensions: {
              code: "NOT_FOUND",
              traceId: "abc-123-def",
              codes: ["CUSTOMER_NOT_FOUND", "ENTITY_MISSING"],
              template: "Customer with ID {id} was not found",
              templateArgs: { id: "customer-123" },
              suggestions: ["Check the customer ID", "Verify the customer exists"],
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      });

      const result = await graphqlTransport.query("query { customer(id: $id) }");

      expect(result.kind).toBe("graphql-error");
      if (result.kind === "graphql-error") {
        expect(result.errors[0].extensions?.code).toBe(
          InsurUpGraphQLErrorCode.NotFound
        );
        expect(result.errors[0].extensions?.traceId).toBe("abc-123-def");
        expect(result.errors[0].extensions?.codes).toEqual([
          "CUSTOMER_NOT_FOUND",
          "ENTITY_MISSING",
        ]);
        expect(result.errors[0].extensions?.template).toBe(
          "Customer with ID {id} was not found"
        );
        expect(result.errors[0].extensions?.templateArgs).toEqual({
          id: "customer-123",
        });
        expect(result.errors[0].extensions?.suggestions).toEqual([
          "Check the customer ID",
          "Verify the customer exists",
        ]);
      }
    });

    it("should map all error codes correctly", async () => {
      const errorCodes = [
        { code: "FORBIDDEN", expected: InsurUpGraphQLErrorCode.Forbidden },
        { code: "UNAUTHORIZED", expected: InsurUpGraphQLErrorCode.Unauthorized },
        { code: "NOT_FOUND", expected: InsurUpGraphQLErrorCode.NotFound },
        { code: "BAD_REQUEST", expected: InsurUpGraphQLErrorCode.BadRequest },
        { code: "CONFLICT", expected: InsurUpGraphQLErrorCode.Conflict },
        { code: "NOT_SUPPORTED", expected: InsurUpGraphQLErrorCode.NotSupported },
        { code: "UPSTREAM_ERROR", expected: InsurUpGraphQLErrorCode.UpstreamError },
        { code: "INTERNAL_ERROR", expected: InsurUpGraphQLErrorCode.InternalError },
        {
          code: "VALIDATION_ERROR",
          expected: InsurUpGraphQLErrorCode.ValidationError,
        },
        {
          code: "FILTER_REQUIRED",
          expected: InsurUpGraphQLErrorCode.FilterRequired,
        },
        {
          code: "FILTER_MAX_SPAN_EXCEEDED",
          expected: InsurUpGraphQLErrorCode.FilterMaxSpanExceeded,
        },
        { code: "UNKNOWN_CODE", expected: InsurUpGraphQLErrorCode.Unknown },
      ];

      for (const { code, expected } of errorCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          text: () =>
            Promise.resolve(
              JSON.stringify({
                data: null,
                errors: [{ message: "Test", extensions: { code } }],
              })
            ),
        });

        const result = await graphqlTransport.query("query { test }");

        expect(result.kind).toBe("graphql-error");
        if (result.kind === "graphql-error") {
          expect(result.errors[0].extensions?.code).toBe(expected);
        }
      }
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await graphqlTransport.query("query { test }");

      expect(result.kind).toBe("client-error");
      if (result.kind === "client-error") {
        expect(result.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
      }
    });

    it("should handle empty data response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: null })),
      });

      const result = await graphqlTransport.query("query { test }");

      expect(result.kind).toBe("client-error");
      if (result.kind === "client-error") {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
        // The error message comes from createDeserializationError which wraps the underlying error
        expect(result.message).toBe("Failed to parse response JSON");
      }
    });

    it("should handle HTTP-level errors (401 Unauthorized) as server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              type: "https://api.insurup.com/problems/unauthorized",
              title: "Unauthorized",
              detail: "Invalid or expired token",
              status: 401,
            })
          ),
      });

      const result = await graphqlTransport.query("query { test }");

      // HTTP level errors are returned as server errors
      expect(result.kind).toBe("server-error");
      if (result.kind === "server-error") {
        expect(result.status).toBe(401);
      }
    });

    it("should handle HTTP-level errors (500 Internal Server Error) as server errors", async () => {
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
              detail: "An unexpected error occurred",
              status: 500,
            })
          ),
      });

      const result = await graphqlTransport.query("query { test }");

      // HTTP level errors are returned as server errors
      expect(result.kind).toBe("server-error");
      if (result.kind === "server-error") {
        expect(result.status).toBe(500);
      }
    });
  });

  describe("Query Building", () => {
    it("should send query in correct format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: { test: "value" } })),
      });

      const query = "query TestQuery { test }";
      await graphqlTransport.query(query);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body).toEqual({
        query: "query TestQuery { test }",
        variables: undefined,
      });
    });

    it("should handle queries with filters and sorting variables", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              data: { customersNew: { nodes: [], totalCount: 0 } },
            })
          ),
      });

      const query = `
        query GetCustomers(
          $first: Int
          $filter: QueryCustomerModelFilterInput
          $order: [QueryCustomerModelSortInput!]
        ) {
          customersNew(first: $first, where: $filter, order: $order) {
            nodes { id }
            totalCount
          }
        }
      `;

      const variables = {
        first: 10,
        filter: { type: { eq: "INDIVIDUAL" } },
        order: [{ createdAt: "DESC" }],
      };

      await graphqlTransport.query(query, variables);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.variables).toEqual(variables);
    });
  });

  describe("Request Options", () => {
    it("should pass request options to HTTP transport", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({ data: { test: true } })),
      });

      await graphqlTransport.query("query { test }", undefined, {
        headers: { "X-Custom-Header": "value" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom-Header": "value",
          }),
        })
      );
    });
  });
});
