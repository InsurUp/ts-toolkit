# Use Package Manager CLI for Dependencies

Never manually edit `dependencies` or `devDependencies` in `package.json`.

Always use the package manager CLI:

```bash
# Good
bun add <package>
bun add -d <package>      # devDependency
bun remove <package>

# Bad - Never manually edit package.json
# Don't add/remove/modify entries in dependencies or devDependencies by hand
```

This ensures:

- Lockfile stays in sync
- Version resolution is handled correctly
- No typos in package names or versions
