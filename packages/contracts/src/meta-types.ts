/**
 * @fileoverview Runtime Field Metadata Types
 * @description Hand-written types for runtime field metadata.
 * Used by auto-generated .meta.ts files.
 */

/**
 * Operator name as accepted by the server `filtering_*` inputs.
 * Mirrors `StringOperationFilterInput`, `IntOperationFilterInput`,
 * `DateTimeOperationFilterInput`, `EnumOperationFilterInput`, etc.
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'in'
  | 'nin'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith'
  | 'gt'
  | 'ngt'
  | 'gte'
  | 'ngte'
  | 'lt'
  | 'nlt'
  | 'lte'
  | 'nlte';

/**
 * Operator name as accepted by the server `searching_*` inputs.
 * Independent from `FilterOperator` — the two domains share most names but
 * they describe different server inputs (`searching_SearchStringOperationFilterInput`
 * adds the text-search operations; scalar searching inputs happen to mirror their
 * filtering counterparts).
 */
export type SearchOperator =
  | 'eq'
  | 'neq'
  | 'in'
  | 'nin'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith'
  | 'gt'
  | 'ngt'
  | 'gte'
  | 'ngte'
  | 'lt'
  | 'nlt'
  | 'lte'
  | 'nlte'
  | 'textSearch'
  | 'wildcard'
  | 'autocomplete';

interface BaseFieldMeta {
  readonly nullable: boolean;
  readonly filterable: boolean;
  readonly searchable: boolean;
  readonly filterOperators?: readonly FilterOperator[];
  readonly searchOperators?: readonly SearchOperator[];
}

export interface StringFieldMeta extends BaseFieldMeta {
  readonly type: 'string';
}

export interface NumberFieldMeta extends BaseFieldMeta {
  readonly type: 'number';
}

export interface BooleanFieldMeta extends BaseFieldMeta {
  readonly type: 'boolean';
}

export interface DateTimeFieldMeta extends BaseFieldMeta {
  readonly type: 'DateTime';
}

export interface DateOnlyFieldMeta extends BaseFieldMeta {
  readonly type: 'DateOnly';
}

export interface EnumFieldMeta extends BaseFieldMeta {
  readonly type: 'enum';
  readonly values: readonly string[];
}

export type FieldMeta =
  | StringFieldMeta
  | NumberFieldMeta
  | BooleanFieldMeta
  | DateTimeFieldMeta
  | DateOnlyFieldMeta
  | EnumFieldMeta;

export type ModelMeta = Readonly<Record<string, FieldMeta>>;
