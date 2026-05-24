/**
 * @fileoverview Wire-field rename layer.
 *
 * Some TS fields in `@insurup/contracts` serialize to a different name on
 * the wire (e.g. `type` -> `$type` for the backend's `[JsonDerivedType]`
 * discriminator). The rename rules are produced by the contracts' codegen
 * (`generate-wire-mappings.ts`) -- this module reads `WIRE_FIELD_MAPPINGS`
 * and applies the rules at the HTTP boundary.
 *
 *   Outbound (`encodeWireFields`): for every mapping, rename `tsName` ->
 *   `wireName` on any object whose `tsName` value is in `triggerValues`.
 *   If `triggerValues` is `null` the rename is unconditional.
 *
 *   Inbound (`decodeWireFields`): every mapped `wireName` is renamed back
 *   to its `tsName`. We throw at module load if two contracts disagree on
 *   the inbound mapping for the same `wireName`.
 *
 * Adding a new wire-renamed field requires no edits here -- just a
 * `@wire <name>` JSDoc tag on the contracts side.
 */

import { WIRE_FIELD_MAPPINGS, type WireFieldMapping } from '@insurup/contracts';

interface OutboundRule {
  readonly wireName: string;
  readonly triggerValues: ReadonlySet<string> | null;
}

const OUTBOUND_RULES: ReadonlyMap<string, readonly OutboundRule[]> = (() => {
  // Multiple contracts can share `(tsName, wireName)` -- e.g. every member of a
  // polymorphic union contributes one entry to WIRE_FIELD_MAPPINGS. Merge them
  // here so the encoder does one lookup per object: the trigger set is the
  // union of every contract's trigger values, and an unconditional rule
  // (`triggerValues: null`) anywhere on the pair makes the merged rule
  // unconditional too.
  const buckets = new Map<string, Map<string, OutboundRule>>();
  for (const { tsName, wireName, triggerValues } of WIRE_FIELD_MAPPINGS) {
    let perTs = buckets.get(tsName);
    if (!perTs) {
      perTs = new Map();
      buckets.set(tsName, perTs);
    }
    const existing = perTs.get(wireName);
    if (!existing) {
      perTs.set(wireName, {
        wireName,
        triggerValues: triggerValues ? new Set(triggerValues) : null,
      });
      continue;
    }
    if (existing.triggerValues === null || triggerValues === null) {
      perTs.set(wireName, { wireName, triggerValues: null });
      continue;
    }
    const merged = new Set(existing.triggerValues);
    for (const v of triggerValues) merged.add(v);
    perTs.set(wireName, { wireName, triggerValues: merged });
  }

  const result = new Map<string, OutboundRule[]>();
  for (const [tsName, perTs] of buckets) {
    result.set(tsName, [...perTs.values()]);
  }
  return result;
})();

const INBOUND_RULES: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const { tsName, wireName } of WIRE_FIELD_MAPPINGS) {
    const existing = map.get(wireName);
    if (existing !== undefined && existing !== tsName) {
      throw new Error(
        `wire-mapping: two contracts map "${wireName}" to different TS field names ` +
          `("${existing}" and "${tsName}"). Inbound rename is ambiguous.`
      );
    }
    map.set(wireName, tsName);
  }
  return map;
})();

function shouldRename(rule: OutboundRule, value: unknown): boolean {
  if (rule.triggerValues === null) return true;
  return typeof value === 'string' && rule.triggerValues.has(value);
}

/**
 * Returns a deep-cloned copy of `value` with every TS field whose wire name
 * differs renamed according to {@link WIRE_FIELD_MAPPINGS}. Source object is
 * not mutated.
 */
export function encodeWireFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(encodeWireFields);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;

  const renames = new Map<string, string>();
  for (const [tsName, rules] of OUTBOUND_RULES) {
    if (!(tsName in source)) continue;
    const original = source[tsName];
    for (const rule of rules) {
      if (rule.wireName in source) continue; // wire name already present -- don't clobber
      if (shouldRename(rule, original)) {
        renames.set(tsName, rule.wireName);
        break;
      }
    }
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = encodeWireFields(source[key]);
    const renamed = renames.get(key);
    if (renamed !== undefined) {
      result[renamed] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}

/**
 * Returns a deep-cloned copy of `value` with every wire-name field renamed
 * back to its public TS name. Source object is not mutated.
 */
export function decodeWireFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(decodeWireFields);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = decodeWireFields(source[key]);
    const tsName = INBOUND_RULES.get(key);
    if (tsName !== undefined && !(tsName in source)) {
      result[tsName] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}

export type { WireFieldMapping };
