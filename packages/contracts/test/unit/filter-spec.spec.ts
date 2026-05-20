import { describe, expect, it } from 'vitest';
import { QueryCustomerModelMeta } from '../../src/graphql/customers.meta.js';

/**
 * Tests that the generated meta carries the right filter/search operator
 * surface. The operator lists themselves are codegen output — we verify the
 * shape per known kind so regressions in `generate-meta.ts` get caught.
 */
describe('generated meta filter/search surface', () => {
  it('marks `searchScore` as neither filterable nor searchable', () => {
    expect(QueryCustomerModelMeta.searchScore.filterable).toBe(false);
    expect(QueryCustomerModelMeta.searchScore.searchable).toBe(false);
  });

  it('string filter operators use the not* names that match the server', () => {
    const ops = QueryCustomerModelMeta.name.filterOperators;
    expect(ops).toContain('notContains');
    expect(ops).toContain('notStartsWith');
    expect(ops).toContain('notEndsWith');
    expect(ops).not.toContain('ncontains' as unknown as never);
  });

  it('search string includes the new contains-family operators', () => {
    const ops = QueryCustomerModelMeta.name.searchOperators;
    expect(ops).toContain('contains');
    expect(ops).toContain('notContains');
    expect(ops).toContain('startsWith');
    expect(ops).toContain('notStartsWith');
    expect(ops).toContain('endsWith');
    expect(ops).toContain('notEndsWith');
    expect(ops).toContain('textSearch');
    expect(ops).toContain('wildcard');
    expect(ops).toContain('autocomplete');
  });

  it('enum filter operators are eq/neq/in/nin only', () => {
    expect(QueryCustomerModelMeta.type.filterOperators).toEqual(['eq', 'neq', 'in', 'nin']);
  });

  it('comparable filter operators include gt/gte/lt/lte family', () => {
    const ops = QueryCustomerModelMeta.createdAt.filterOperators;
    expect(ops).toContain('gt');
    expect(ops).toContain('gte');
    expect(ops).toContain('lt');
    expect(ops).toContain('lte');
  });
});
