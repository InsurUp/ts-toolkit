# Simplicity First

Always prefer the simplest solution that solves the problem.

## Less Code

- Avoid over-engineering and premature abstraction
- Don't add layers, wrappers, or patterns "just in case"
- If 10 lines solve it, don't write 50

```typescript
// Bad
class UserNameFormatterFactory {
  createFormatter(): UserNameFormatter { ... }
}

// Good
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

## Readable

- Clear, descriptive names over clever abbreviations
- Obvious logic over clever tricks
- Easy to follow at first glance

## Minimal Dependencies

- Don't add a package when simple code works
- Prefer standard library / built-in solutions
- Each dependency is a liability

> "Can this be simpler?" — Ask this before every solution.
