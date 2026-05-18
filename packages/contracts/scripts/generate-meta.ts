/**
 * Codegen script: generates .meta.ts files with runtime field metadata
 * for interfaces tagged with `@meta` JSDoc.
 *
 * The first positional arg is the primary scan directory — its entries
 * go into the generated registry.meta.ts (also written there).
 * Additional positional args are extra directories to scan (.meta.ts
 * files are generated, but entries are NOT added to the registry).
 *
 * Run: bun run scripts/generate-meta.ts <primary-dir> [extra-dir ...]
 */

import { Project, type InterfaceDeclaration, type Type, SyntaxKind } from 'ts-morph';
import { resolve, basename, dirname, join, relative } from 'node:path';
import { writeFileSync } from 'node:fs';
import prettier from 'prettier';

const ROOT = resolve(import.meta.dirname, '..');
const META_TYPES_PATH = resolve(ROOT, 'src/meta-types.js');

const prettierConfig = await prettier.resolveConfig(ROOT);

async function writeFormatted(path: string, content: string): Promise<void> {
  const formatted = await prettier.format(content, { ...prettierConfig, parser: 'typescript' });
  writeFileSync(path, formatted, 'utf-8');
}

// Parse CLI args: first = primary dir, rest = extra dirs
const args = process.argv.slice(2).map((d) => resolve(ROOT, d));
if (args.length === 0) {
  console.error('Usage: generate-meta.ts <primary-dir> [extra-dir ...]');
  process.exit(1);
}
const [primaryDir, ...extraDirs] = args as [string, ...string[]];

// ---------------------------------------------------------------------------
// 1. Load project
// ---------------------------------------------------------------------------

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
});

// ---------------------------------------------------------------------------
// 2. Scan for @meta interfaces grouped by source file
// ---------------------------------------------------------------------------

// Add extra directory source files to the project so ts-morph can resolve them
for (const dir of extraDirs) {
  project.addSourceFilesAtPaths(join(dir, '*.ts'));
}

interface FieldEntry {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'DateTime' | 'DateOnly' | 'enum';
  nullable: boolean;
  values?: string[]; // only for enum
}

interface MetaInterface {
  interfaceName: string;
  fields: FieldEntry[];
}

/** Map from source file path -> list of meta interfaces in that file */
const fileMap = new Map<string, MetaInterface[]>();

const scanDirs = [primaryDir, ...extraDirs];

for (const scanDir of scanDirs) {
  for (const sourceFile of project.getSourceFiles(join(scanDir, '*.ts'))) {
    const filePath = sourceFile.getFilePath();

    // Skip already-generated files and the meta-types file
    if (filePath.endsWith('.meta.ts') || filePath.endsWith('meta-types.ts')) continue;

    const interfaces = sourceFile.getInterfaces().filter(hasMetaTag);
    if (interfaces.length === 0) continue;

    const metas: MetaInterface[] = [];

    for (const iface of interfaces) {
      const fields = processInterface(iface);
      metas.push({ interfaceName: iface.getName(), fields });
    }

    fileMap.set(filePath, metas);
  }
}

// ---------------------------------------------------------------------------
// 3. Classify properties
// ---------------------------------------------------------------------------

function hasMetaTag(iface: InterfaceDeclaration): boolean {
  const jsDocs = iface.getJsDocs();
  return jsDocs.some((doc) => doc.getFullText().includes('@meta'));
}

function processInterface(iface: InterfaceDeclaration): FieldEntry[] {
  const fields: FieldEntry[] = [];

  for (const prop of iface.getProperties()) {
    const name = prop.getName();
    const isOptional = prop.hasQuestionToken();
    let propType = prop.getType();

    // Unwrap null / undefined from union
    const { type: unwrapped, nullable: hasNullUndefined } = unwrapNullable(propType);
    propType = unwrapped;
    const nullable = isOptional || hasNullUndefined;

    const classified = classifyType(propType);
    if (!classified) continue; // skip objects, arrays, unknown

    fields.push({
      name,
      ...classified,
      nullable,
    });
  }

  return fields;
}

function unwrapNullable(type: Type): { type: Type; nullable: boolean } {
  if (!type.isUnion()) return { type, nullable: false };

  const parts = type.getUnionTypes();
  const nonNullParts = parts.filter((t) => !t.isNull() && !t.isUndefined());
  const hasNullOrUndefined = nonNullParts.length < parts.length;

  if (nonNullParts.length === 1) {
    return { type: nonNullParts[0]!, nullable: hasNullOrUndefined };
  }

  // Multiple non-null parts: check if they're all enum literals from the same enum.
  // TypeScript expands `MyEnum | null` into `MyEnum.A | MyEnum.B | ... | null`.
  if (nonNullParts.length > 1 && nonNullParts.every((t) => t.isEnumLiteral())) {
    // Return the first part -- classifyType will resolve the full enum from any member
    return { type: nonNullParts[0]!, nullable: hasNullOrUndefined };
  }

  // Multiple non-null parts of different kinds -- not a simple nullable, skip
  return { type, nullable: hasNullOrUndefined };
}

function classifyType(type: Type): Omit<FieldEntry, 'name' | 'nullable'> | null {
  // Check for array first -- skip
  if (type.isArray()) return null;

  // Check by type name for DateTime / DateOnly (they are classes)
  const symbol = type.getSymbol() ?? type.getAliasSymbol();
  const typeName = symbol?.getName();

  if (typeName === 'DateTime') return { type: 'DateTime' };
  if (typeName === 'DateOnly') return { type: 'DateOnly' };

  // Enum -- check BEFORE primitives because string enum literals also match isStringLiteral()
  if (type.isEnum() || type.isEnumLiteral()) {
    const values = resolveEnumValues(type);
    if (values) return { type: 'enum', values };
  }

  // Primitives
  if (type.isString() || type.isStringLiteral()) return { type: 'string' };
  if (type.isNumber() || type.isNumberLiteral()) return { type: 'number' };
  if (type.isBoolean() || type.isBooleanLiteral()) return { type: 'boolean' };

  // Object / interface / other -- skip
  return null;
}

function resolveEnumValues(type: Type): string[] | null {
  const symbol = type.getSymbol();
  if (!symbol) return null;

  // Direct enum declaration (full enum type)
  for (const decl of symbol.getDeclarations()) {
    if (decl.getKind() === SyntaxKind.EnumDeclaration) {
      const enumDecl = decl.asKindOrThrow(SyntaxKind.EnumDeclaration);
      return enumDecl.getMembers().map((m) => {
        const val = m.getValue();
        return typeof val === 'string' ? val : String(val);
      });
    }
  }

  // Enum literal (single member) -- navigate to parent enum declaration
  if (type.isEnumLiteral()) {
    for (const decl of symbol.getDeclarations()) {
      if (decl.getKind() === SyntaxKind.EnumMember) {
        const enumDecl = decl.getParentIfKindOrThrow(SyntaxKind.EnumDeclaration);
        return enumDecl.getMembers().map((m) => {
          const val = m.getValue();
          return typeof val === 'string' ? val : String(val);
        });
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 4. Generate .meta.ts files
// ---------------------------------------------------------------------------

const HEADER = '// This file is auto-generated by generate-meta.ts. Do not edit.\n';

/** All generated meta exports: { metaVarName, sourceBaseName } */
const registry: { metaVarName: string; sourceBaseName: string }[] = [];

for (const [filePath, metas] of fileMap) {
  const dir = dirname(filePath);
  const base = basename(filePath, '.ts');
  const outPath = join(dir, `${base}.meta.ts`);

  // Compute relative import path to meta-types.ts
  const relImport = relative(dir, META_TYPES_PATH).replace(/\\/g, '/');
  const importPath = relImport.startsWith('.') ? relImport : `./${relImport}`;

  const lines: string[] = [HEADER, `import type { ModelMeta } from "${importPath}";\n`];

  const isPrimaryDir = filePath.startsWith(primaryDir);

  for (const meta of metas) {
    const varName = `${meta.interfaceName}Meta`;
    // Only add to registry if from the primary directory
    if (isPrimaryDir) {
      registry.push({ metaVarName: varName, sourceBaseName: base });
    }

    lines.push(`export const ${varName} = {`);

    for (const field of meta.fields) {
      const parts: string[] = [`type: "${field.type}"`];
      if (field.type === 'enum' && field.values) {
        parts.push(`values: [${field.values.map((v) => `"${v}"`).join(', ')}]`);
      }
      parts.push(`nullable: ${field.nullable}`);
      lines.push(`  ${field.name}: { ${parts.join(', ')} },`);
    }

    lines.push('} as const satisfies ModelMeta;\n');
  }

  await writeFormatted(outPath, lines.join('\n'));
  console.log(`  wrote ${outPath.replace(ROOT + '/', '')}`);
}

// ---------------------------------------------------------------------------
// 5. Generate registry.meta.ts
// ---------------------------------------------------------------------------

const registryPath = join(primaryDir, 'registry.meta.ts');

// Group imports by source file
const importsBySource = new Map<string, string[]>();
for (const entry of registry) {
  const list = importsBySource.get(entry.sourceBaseName) ?? [];
  list.push(entry.metaVarName);
  importsBySource.set(entry.sourceBaseName, list);
}

const registryLines: string[] = [HEADER];

for (const [source, names] of importsBySource) {
  registryLines.push(`import { ${names.join(', ')} } from "./${source}.meta.js";`);
}

registryLines.push('');
registryLines.push('export const META_REGISTRY = {');
for (const entry of registry) {
  // Key is the interface name (strip "Meta" suffix)
  const key = entry.metaVarName.replace(/Meta$/, '');
  registryLines.push(`  ${key}: ${entry.metaVarName},`);
}
registryLines.push('} as const;');
registryLines.push('');
registryLines.push('type MetaRegistry = typeof META_REGISTRY;');
registryLines.push('');
registryLines.push('export type ModelName = keyof MetaRegistry;');
registryLines.push('');
registryLines.push(
  'export function getModelMeta<K extends ModelName>(modelName: K): MetaRegistry[K] {'
);
registryLines.push('  return META_REGISTRY[modelName];');
registryLines.push('}');
registryLines.push('');

await writeFormatted(registryPath, registryLines.join('\n'));
console.log(`  wrote ${registryPath.replace(ROOT + '/', '')}`);

console.log(`\nGenerated meta for ${registry.length} interfaces.`);
