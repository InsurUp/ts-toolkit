/**
 * @fileoverview Runtime Field Metadata Types
 * @description Hand-written types for runtime field metadata.
 * Used by auto-generated .meta.ts files.
 */

export interface StringFieldMeta {
  readonly type: "string";
  readonly nullable: boolean;
}

export interface NumberFieldMeta {
  readonly type: "number";
  readonly nullable: boolean;
}

export interface BooleanFieldMeta {
  readonly type: "boolean";
  readonly nullable: boolean;
}

export interface DateTimeFieldMeta {
  readonly type: "DateTime";
  readonly nullable: boolean;
}

export interface DateOnlyFieldMeta {
  readonly type: "DateOnly";
  readonly nullable: boolean;
}

export interface EnumFieldMeta {
  readonly type: "enum";
  readonly values: readonly string[];
  readonly nullable: boolean;
}

export type FieldMeta =
  | StringFieldMeta
  | NumberFieldMeta
  | BooleanFieldMeta
  | DateTimeFieldMeta
  | DateOnlyFieldMeta
  | EnumFieldMeta;

export type ModelMeta = Readonly<Record<string, FieldMeta>>;
