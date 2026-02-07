/**
 * Runtime Field Metadata Usage Example
 *
 * Demonstrates how to use auto-generated meta objects for runtime
 * field introspection -- useful for building dynamic UIs, filters,
 * column configuration, and validation.
 */

import {
  getModelMeta,
  QueryCustomerModelMeta,
  QueryPoliciesResultMeta,
} from "@insurup/contracts";
import type { FieldMeta, EnumFieldMeta } from "@insurup/contracts";

console.log("InsurUp Contracts - Runtime Field Metadata Example\n");

// ============================================================================
// 1. Basic field introspection
// ============================================================================

// Access field metadata directly from the imported meta object
console.log("--- Basic Field Introspection ---");
console.log("id type:", QueryCustomerModelMeta.id.type); // "string"
console.log("createdAt type:", QueryCustomerModelMeta.createdAt.type); // "DateTime"
console.log("birthDate type:", QueryCustomerModelMeta.birthDate.type); // "DateOnly"
console.log("type type:", QueryCustomerModelMeta.type.type); // "enum"

// Check nullability
console.log("id nullable:", QueryCustomerModelMeta.id.nullable); // false
console.log("name nullable:", QueryCustomerModelMeta.name.nullable); // true

// ============================================================================
// 2. Dynamic model lookup with getModelMeta
// ============================================================================

// Look up any model's meta by name -- with full autocomplete and type safety
console.log("\n--- Dynamic Model Lookup ---");

const customerMeta = getModelMeta("QueryCustomerModel");
const policyMeta = getModelMeta("QueryPoliciesResult");

console.log("Customer fields:", Object.keys(customerMeta).length);
console.log("Policy fields:", Object.keys(policyMeta).length);

// ============================================================================
// 3. Enumerating fields by type
// ============================================================================

console.log("\n--- Fields By Type ---");

function groupFieldsByType(meta: Record<string, FieldMeta>) {
  const groups: Record<string, string[]> = {};
  for (const [fieldName, fieldMeta] of Object.entries(meta)) {
    const list = groups[fieldMeta.type] ?? [];
    list.push(fieldName);
    groups[fieldMeta.type] = list;
  }
  return groups;
}

const grouped = groupFieldsByType(QueryCustomerModelMeta);
console.log("String fields:", grouped["string"]);
console.log("Enum fields:", grouped["enum"]);
console.log("Date fields:", grouped["DateTime"]);

// ============================================================================
// 4. Type narrowing on the discriminant
// ============================================================================

console.log("\n--- Enum Value Extraction ---");

function getEnumFields(meta: Record<string, FieldMeta>): Record<string, EnumFieldMeta> {
  const result: Record<string, EnumFieldMeta> = {};
  for (const [fieldName, fieldMeta] of Object.entries(meta)) {
    if (fieldMeta.type === "enum") {
      // TypeScript narrows to EnumFieldMeta here -- `values` is available
      result[fieldName] = fieldMeta;
    }
  }
  return result;
}

const enumFields = getEnumFields(QueryCustomerModelMeta);
for (const [name, field] of Object.entries(enumFields)) {
  console.log(`  ${name}: [${field.values.join(", ")}]`);
}

// ============================================================================
// 5. Practical use case: building a filter config from meta
// ============================================================================

console.log("\n--- Filter Configuration ---");

interface FilterConfig {
  field: string;
  label: string;
  inputType: "text" | "number" | "date" | "datetime" | "select" | "checkbox";
  options?: string[];
}

function buildFilterConfig(meta: Record<string, FieldMeta>): FilterConfig[] {
  const filters: FilterConfig[] = [];

  for (const [field, fieldMeta] of Object.entries(meta)) {
    const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

    switch (fieldMeta.type) {
      case "string":
        filters.push({ field, label, inputType: "text" });
        break;
      case "number":
        filters.push({ field, label, inputType: "number" });
        break;
      case "boolean":
        filters.push({ field, label, inputType: "checkbox" });
        break;
      case "DateTime":
        filters.push({ field, label, inputType: "datetime" });
        break;
      case "DateOnly":
        filters.push({ field, label, inputType: "date" });
        break;
      case "enum":
        filters.push({
          field,
          label,
          inputType: "select",
          options: [...fieldMeta.values],
        });
        break;
    }
  }

  return filters;
}

const filters = buildFilterConfig(QueryPoliciesResultMeta);
for (const f of filters.slice(0, 5)) {
  console.log(`  ${f.field}: ${f.inputType}${f.options ? ` (${f.options.length} options)` : ""}`);
}
console.log(`  ... and ${filters.length - 5} more filters`);
