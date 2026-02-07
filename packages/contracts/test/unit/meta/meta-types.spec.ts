import { describe, it, expect } from "vitest";
import type { FieldMeta } from "../../../src/meta-types.js";
import { META_REGISTRY } from "../../../src/graphql/registry.meta.js";
import { TestModelMeta } from "./test-model.meta.js";

// ---------------------------------------------------------------------------
// FieldMeta type system
// ---------------------------------------------------------------------------

describe("FieldMeta type system", () => {
  it("supports all six field types", () => {
    const types: FieldMeta["type"][] = ["string", "number", "boolean", "DateTime", "DateOnly", "enum"];
    const fields: FieldMeta[] = [
      TestModelMeta.id,
      TestModelMeta.age,
      TestModelMeta.isActive,
      TestModelMeta.createdAt,
      TestModelMeta.birthDate,
      TestModelMeta.status,
    ];

    for (let i = 0; i < fields.length; i++) {
      expect(fields[i]!.type).toBe(types[i]);
    }
  });

  it("nullable is always a boolean", () => {
    for (const field of Object.values(TestModelMeta)) {
      expect(typeof field.nullable).toBe("boolean");
    }
  });

  it("enum fields have a values array of strings", () => {
    expect(Array.isArray(TestModelMeta.status.values)).toBe(true);
    expect(TestModelMeta.status.values.length).toBeGreaterThan(0);
    for (const v of TestModelMeta.status.values) {
      expect(typeof v).toBe("string");
    }
  });

  it("non-enum fields do not have a values property", () => {
    expect("values" in TestModelMeta.id).toBe(false);
    expect("values" in TestModelMeta.age).toBe(false);
    expect("values" in TestModelMeta.isActive).toBe(false);
    expect("values" in TestModelMeta.createdAt).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ModelMeta structural contract
// ---------------------------------------------------------------------------

describe("ModelMeta structural contract", () => {
  it("is a record of string keys to FieldMeta values", () => {
    for (const [key, field] of Object.entries(TestModelMeta)) {
      expect(typeof key).toBe("string");
      expect(field).toHaveProperty("type");
      expect(field).toHaveProperty("nullable");
    }
  });

  it("type discriminant enables narrowing to access enum values", () => {
    for (const field of Object.values(TestModelMeta)) {
      if (field.type === "enum") {
        // TypeScript narrows to EnumFieldMeta here
        expect(Array.isArray(field.values)).toBe(true);
      }
    }
  });

  it("nullable fields are distinguishable from required fields", () => {
    const nullable = Object.entries(TestModelMeta)
      .filter(([, f]) => f.nullable)
      .map(([k]) => k);
    const required = Object.entries(TestModelMeta)
      .filter(([, f]) => !f.nullable)
      .map(([k]) => k);

    expect(nullable).toContain("name");
    expect(nullable).toContain("birthDate");
    expect(nullable).toContain("role");
    expect(required).toContain("id");
    expect(required).toContain("createdAt");
    expect(required).toContain("status");
  });
});

// ---------------------------------------------------------------------------
// Generated meta objects: structural validation (no hardcoded values)
// ---------------------------------------------------------------------------

describe("generated meta objects", () => {
  const allMetas = Object.entries(META_REGISTRY).map(([name, meta]) => ({ name, meta }));

  it.each(allMetas)(
    "$name has at least one field",
    ({ meta }) => {
      expect(Object.keys(meta).length).toBeGreaterThan(0);
    },
  );

  it.each(allMetas)(
    "$name has valid type discriminants on all fields",
    ({ meta }) => {
      const validTypes = ["string", "number", "boolean", "DateTime", "DateOnly", "enum"];
      for (const [key, field] of Object.entries(meta)) {
        expect(validTypes, `field "${key}" has invalid type "${field.type}"`).toContain(field.type);
      }
    },
  );

  it.each(allMetas)(
    "$name has nullable as a boolean on all fields",
    ({ meta }) => {
      for (const [key, field] of Object.entries(meta)) {
        expect(typeof field.nullable, `field "${key}" has non-boolean nullable`).toBe("boolean");
      }
    },
  );

  it.each(allMetas)(
    "$name enum fields have non-empty string values arrays",
    ({ meta }) => {
      for (const [key, field] of Object.entries(meta)) {
        if (field.type === "enum") {
          expect(field.values.length, `enum field "${key}" has empty values`).toBeGreaterThan(0);
          for (const v of field.values) {
            expect(typeof v, `enum field "${key}" has non-string value`).toBe("string");
          }
        }
      }
    },
  );

  it.each(allMetas)(
    "$name non-enum fields do not have a values property",
    ({ meta }) => {
      for (const [key, field] of Object.entries(meta)) {
        if (field.type !== "enum") {
          expect("values" in field, `non-enum field "${key}" has values`).toBe(false);
        }
      }
    },
  );
});
