---
name: fullstack-setup
description: Remembers and manages full-stack development language/tech stack configuration. Stores project preferences, coding standards, and tech choices for consistent development. Use when setting up new projects, remembering tech stack, or maintaining coding standards across projects.
---

# Full Stack Setup - Tech Stack Memory

Persistent memory for your full-stack development preferences and coding standards.

## Purpose

Remember your:
- Preferred languages and frameworks
- Coding standards and conventions
- Project templates and boilerplates
- Architecture patterns
- Team preferences

## Configuration File

Stored in: `.opencode/memory/tech-stack.json`

```json
{
  "preferences": {
    "frontend": {
      "framework": "react",
      "language": "typescript",
      "styling": "tailwind",
      "state": "tanstack-query",
      "routing": "tanstack-router",
      "ui": "shadcn"
    },
    "backend": {
      "language": "go",
      "framework": "fiber",
      "orm": "sqlx",
      "auth": "jwt"
    },
    "mobile": {
      "framework": "flutter",
      "language": "dart",
      "state": "riverpod"
    },
    "database": {
      "primary": "postgresql",
      "cache": "redis",
      "orm": "prisma"
    },
    "devops": {
      "container": "docker",
      "orchestration": "kubernetes",
      "ci": "github-actions"
    }
  },
  "standards": {
    "typescript": {
      "strict": true,
      "format": "prettier",
      "lint": "eslint"
    },
    "python": {
      "formatter": "ruff",
      "typeChecker": "pyright"
    },
    "go": {
      "format": "gofmt",
      "lint": "golangci-lint"
    },
    "rust": {
      "format": "rustfmt",
      "lint": "clippy"
    }
  },
  "templates": {
    "api": "services/api",
    "web": "apps/web-admin",
    "mobile": "apps/mobile"
  }
}
```

## Usage

### View Current Setup

```
/fullstack-setup show
```

Displays current tech stack configuration.

### Update Preferences

```
/fullstack-setup set frontend.framework react
/fullstack-setup set backend.language go
/fullstack-setup set mobile.framework flutter
```

### Load Template

```
/fullstack-setup template api      # Load API template
/fullstack-setup template web      # Load web frontend template
/fullstack-setup template mobile   # Load mobile template
```

### Save Current Project as Template

```
/fullstack-setup save <template-name>
```

### Reset to Defaults

```
/fullstack-setup reset
```

## Language-Specific Standards

### TypeScript/React

```typescript
// Prefer functional components
const Component = () => {}

// Use TanStack Query for server state
const { data } = useQuery({ queryKey: ['items'], queryFn: fetchItems })

// Use Zod for validation
const schema = z.object({ name: z.string() })
```

### Go

```go
// Follow effective go patterns
func Handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    // Use context for request-scoped values
}
```

### Python

```python
# Use type hints everywhere
def process_data(items: list[Item]) -> Result:
    # Prefer async for I/O
    async with session() as db:
        return await db.fetch_all(items)
```

### Rust

```rust
// Use Result for error handling
fn process() -> Result<Data, Error> {
    // Prefer iterators
    items.iter().map(|i| i.process()).collect()
}
```

### Flutter/Dart

```dart
// Use null safety
class Widget extends StatelessWidget {
  const Widget({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

## Integration

- **full-stack-flow**: Uses this config to generate consistent code
- **function-memory**: Stores API patterns for reuse
- **hermes-agent**: Can use your preferences for code generation
- **trae-agent**: Applies your standards to generated code

## Example

```
User: /fullstack-setup show

Agent: Current Tech Stack:

Frontend:
  Framework: React 19
  Language: TypeScript (strict)
  Styling: Tailwind CSS
  State: TanStack Query
  Routing: TanStack Router
  UI: shadcn/ui

Backend:
  Language: Go 1.22
  Framework: Fiber
  ORM: sqlx
  Auth: JWT

Mobile:
  Framework: Flutter 3.x
  Language: Dart
  State: Riverpod

Database:
  Primary: PostgreSQL
  Cache: Redis
  ORM: Prisma

Run /fullstack-setup set <key> <value> to update.
```

## Notes

- Preferences are project-specific (stored in .opencode/)
- Global preferences in ~/.config/opencode/tech-stack.json
- Templates can be shared between projects
- Standards are enforced automatically by agents
