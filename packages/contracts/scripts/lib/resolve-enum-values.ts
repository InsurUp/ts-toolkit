import { SyntaxKind, type Type } from 'ts-morph';

/**
 * Returns every string value of the enum behind `type`, or `null` if the
 * type isn't an enum.
 *
 * Handles both the whole-enum case (`MyEnum`) and the single-member case
 * (`MyEnum.A`) — for the latter we walk up to the parent declaration and
 * enumerate all members.
 */
export function resolveEnumValues(type: Type): string[] | null {
  const symbol = type.getSymbol();
  if (!symbol) return null;

  for (const decl of symbol.getDeclarations()) {
    if (decl.getKind() === SyntaxKind.EnumDeclaration) {
      const enumDecl = decl.asKindOrThrow(SyntaxKind.EnumDeclaration);
      return enumDecl.getMembers().map((m) => {
        const val = m.getValue();
        return typeof val === 'string' ? val : String(val);
      });
    }
  }

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
