/**
 * @fileoverview Polymorphic type discriminator conversion.
 *
 * The InsurUp backend serializes polymorphic value objects using a `$type`
 * discriminator (System.Text.Json `[JsonDerivedType]` convention). For a
 * cleaner public TypeScript API the contracts expose these as `type` instead.
 * This module bridges the two on every request/response that flows through
 * the HTTP transport.
 *
 *   Outbound: rename `type` -> `$type` on any object whose `type` value is a
 *             polymorphic discriminator (see {@link looksLikePolymorphicDiscriminator}).
 *   Inbound:  rename `$type` -> `type` whenever the backend emits it. Safe
 *             unconditionally because `$type` is reserved for polymorphic
 *             discriminators in the backend's serializer.
 *
 * Discrimination is convention-based, not registry-based, so adding a new
 * `[JsonDerivedType]` union on the backend requires no changes here. The
 * convention is:
 *
 *   - Backend `[JsonDerivedType]` short names are always lowercase tokens
 *     (e.g. `"range"`, `"audio"`, `"display"`).
 *   - Every regular enum in `@insurup/contracts` uses `SCREAMING_SNAKE_CASE`
 *     (e.g. `'BANK'`, `'INDIVIDUAL'`, `'TURKISH_LIRA'`).
 *
 * The two namespaces don't overlap, so the presence of any uppercase letter
 * in a `type` value is a reliable signal that the field is a regular enum
 * and must be left alone.
 */

/**
 * Returns true when `value` looks like a polymorphic `$type` discriminator
 * emitted by the backend: a non-empty string containing at least one letter
 * and no uppercase letters at all.
 */
function looksLikePolymorphicDiscriminator(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value === value.toLowerCase() &&
    /[a-z]/.test(value)
  );
}

/**
 * Returns a deep-cloned copy of `value` with the public `type` discriminator
 * renamed to the wire-level `$type` on any object whose `type` value matches
 * the polymorphic-discriminator convention. All other fields pass through
 * unchanged.
 */
export function encodePolymorphicTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(encodePolymorphicTypes);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const shouldRename = looksLikePolymorphicDiscriminator(source.type) && !('$type' in source);

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = encodePolymorphicTypes(source[key]);
    if (shouldRename && key === 'type') {
      result['$type'] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}

/**
 * Returns a deep-cloned copy of `value` with the wire-level `$type`
 * discriminator renamed to the public `type` field everywhere it appears.
 * Other fields pass through unchanged.
 */
export function decodePolymorphicTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(decodePolymorphicTypes);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = decodePolymorphicTypes(source[key]);
    if (key === '$type') {
      result['type'] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}
