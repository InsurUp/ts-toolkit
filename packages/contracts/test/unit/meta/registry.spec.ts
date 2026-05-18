import { describe, it, expect } from 'vitest';
import type { ModelName } from '../../../src/graphql/index.js';
import { getModelMeta } from '../../../src/graphql/index.js';
import { META_REGISTRY } from '../../../src/graphql/registry.meta.js';

describe('getModelMeta', () => {
  const allNames = Object.keys(META_REGISTRY) as ModelName[];

  it('returns the correct meta object for each model name', () => {
    for (const name of allNames) {
      expect(getModelMeta(name)).toBe(META_REGISTRY[name]);
    }
  });

  it('returns referentially identical objects (not copies)', () => {
    for (const name of allNames) {
      const meta = getModelMeta(name);
      expect(meta).toBe(META_REGISTRY[name]);
    }
  });

  it('returns objects with at least one field', () => {
    for (const name of allNames) {
      expect(Object.keys(getModelMeta(name)).length).toBeGreaterThan(0);
    }
  });
});
