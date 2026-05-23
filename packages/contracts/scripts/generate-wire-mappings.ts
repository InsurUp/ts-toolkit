/**
 * Codegen script: emits `src/wire-mappings.generated.ts` listing every
 * field whose TS name differs from its wire name.
 *
 * A field is registered by attaching a `@wire <wireName>` JSDoc tag to its
 * property signature:
 *
 *   export interface RangeQuantity {
 *     /** @wire $type *\/
 *     readonly type: 'range';
 *     readonly min: number;
 *     readonly max: number;
 *   }
 *
 * If the field's TS type narrows to a literal or enum, every possible value
 * is recorded as a rename trigger — the SDK only renames `tsName` -> `wireName`
 * when the runtime value is one of those triggers. Otherwise the rename is
 * unconditional.
 *
 * Run: bun run scripts/generate-wire-mappings.ts
 */

import { Project, SyntaxKind, type PropertySignature, type Type } from 'ts-morph';
import { resolve, relative } from 'node:path';
import { writeFileSync } from 'node:fs';
import prettier from 'prettier';
import { resolveEnumValues } from './lib/resolve-enum-values.js';

const ROOT = resolve(import.meta.dirname, '..');
const OUT_PATH = resolve(ROOT, 'src/wire-mappings.generated.ts');
const SRC_DIR = resolve(ROOT, 'src');

const prettierConfig = await prettier.resolveConfig(ROOT);

async function writeFormatted(path: string, content: string): Promise<void> {
  const formatted = await prettier.format(content, { ...prettierConfig, parser: 'typescript' });
  writeFileSync(path, formatted, 'utf-8');
}

// ---------------------------------------------------------------------------
// 1. Load project
// ---------------------------------------------------------------------------

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
});

// ---------------------------------------------------------------------------
// 2. Collect every `@wire <wireName>` annotation
// ---------------------------------------------------------------------------

interface RawMapping {
  tsName: string;
  wireName: string;
  triggerValues: string[] | null;
}

const raw: RawMapping[] = [];

function readWireTag(prop: PropertySignature): string | null {
  for (const doc of prop.getJsDocs()) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'wire') {
        const comment = tag.getCommentText()?.trim();
        if (!comment) {
          throw new Error(
            `generate-wire-mappings: @wire on "${prop.getName()}" at ${prop
              .getSourceFile()
              .getFilePath()}:${prop.getStartLineNumber()} is missing the wire-name argument.`
          );
        }
        return comment;
      }
    }
  }
  return null;
}

function collectTriggerValues(type: Type): string[] | null {
  // String literal (e.g. `'range'`)
  if (type.isStringLiteral()) {
    return [type.getLiteralValueOrThrow() as string];
  }

  // Union of literals
  if (type.isUnion()) {
    const literals: string[] = [];
    for (const part of type.getUnionTypes()) {
      if (part.isStringLiteral()) {
        literals.push(part.getLiteralValueOrThrow() as string);
      } else if (part.isEnumLiteral()) {
        const enumValues = resolveEnumValues(part);
        if (enumValues) {
          for (const v of enumValues) {
            if (!literals.includes(v)) literals.push(v);
          }
        } else {
          return null;
        }
      } else if (part.isNull() || part.isUndefined()) {
        continue;
      } else {
        return null;
      }
    }
    return literals.length > 0 ? literals : null;
  }

  // Enum
  if (type.isEnum() || type.isEnumLiteral()) {
    return resolveEnumValues(type);
  }

  return null;
}

for (const sourceFile of project.getSourceFiles(resolve(SRC_DIR, '**/*.ts'))) {
  const path = sourceFile.getFilePath();
  if (path.endsWith('.generated.ts') || path.endsWith('.meta.ts')) continue;

  // Every property signature in the file — interfaces, type literals nested
  // inside type aliases, unions, etc.
  for (const prop of sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature)) {
    const wireName = readWireTag(prop);
    if (!wireName) continue;

    const tsName = prop.getName();
    const triggerValues = collectTriggerValues(prop.getType());

    raw.push({ tsName, wireName, triggerValues });
  }
}

if (raw.length === 0) {
  console.error(
    'generate-wire-mappings: no @wire tags found. Either the codegen broke or the tags ' +
      'were accidentally removed. Refusing to overwrite the registry with an empty list.'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Merge by (tsName, wireName)
// ---------------------------------------------------------------------------

interface Mapping {
  tsName: string;
  wireName: string;
  triggerValues: readonly string[] | null;
}

const merged = new Map<string, Mapping>();
for (const entry of raw) {
  const key = `${entry.tsName}\0${entry.wireName}`;
  const existing = merged.get(key);
  if (!existing) {
    merged.set(key, {
      tsName: entry.tsName,
      wireName: entry.wireName,
      triggerValues: entry.triggerValues ? [...new Set(entry.triggerValues)].sort() : null,
    });
    continue;
  }

  // If any annotated occurrence is unconditional, the merged entry is too.
  if (entry.triggerValues === null || existing.triggerValues === null) {
    existing.triggerValues = null;
    continue;
  }

  const combined = new Set<string>([...existing.triggerValues, ...entry.triggerValues]);
  existing.triggerValues = [...combined].sort();
}

const mappings = [...merged.values()].sort((a, b) =>
  a.tsName === b.tsName ? a.wireName.localeCompare(b.wireName) : a.tsName.localeCompare(b.tsName)
);

// ---------------------------------------------------------------------------
// 4. Emit registry
// ---------------------------------------------------------------------------

const HEADER = '// This file is auto-generated by generate-wire-mappings.ts. Do not edit.\n';

const lines: string[] = [
  HEADER,
  '/**',
  ' * One field-rename rule produced from a `@wire` JSDoc tag in the contracts.',
  ' * The SDK applies the rename at the HTTP boundary — outbound when the runtime',
  ' * value of `tsName` is in `triggerValues` (or unconditionally if it is `null`),',
  ' * inbound whenever the response carries `wireName`.',
  ' */',
  'export interface WireFieldMapping {',
  '  readonly tsName: string;',
  '  readonly wireName: string;',
  '  /** When non-null, only rename if the value is in this set. */',
  '  readonly triggerValues: readonly string[] | null;',
  '}',
  '',
  'export const WIRE_FIELD_MAPPINGS: readonly WireFieldMapping[] = [',
];

for (const m of mappings) {
  const trig =
    m.triggerValues === null
      ? 'null'
      : `[${m.triggerValues.map((v) => JSON.stringify(v)).join(', ')}]`;
  lines.push(
    `  { tsName: ${JSON.stringify(m.tsName)}, wireName: ${JSON.stringify(m.wireName)}, triggerValues: ${trig} },`
  );
}

lines.push('];');
lines.push('');

await writeFormatted(OUT_PATH, lines.join('\n'));
console.log(`wrote ${relative(ROOT, OUT_PATH)} (${mappings.length} mapping(s))`);
