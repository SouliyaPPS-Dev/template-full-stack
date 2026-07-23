---
name: obsidian-memory
description: Integrates with Obsidian for persistent memory storage. Saves prompt history, learned patterns, and session notes to Obsidian vault. Use when saving to Obsidian, retrieving memories, or managing knowledge base. Triggers on: obsidian, memory, vault, notes, knowledge, save.
---

# Obsidian Memory - Knowledge Base Integration

Connect OpenCode to your Obsidian vault for persistent memory.

## Purpose

Save everything to Obsidian:
- Prompt history and responses
- Learned patterns and code snippets
- Session notes and decisions
- Project documentation
- Knowledge graph connections

## Setup

### 1. Your Vault Location

```
/Users/souliyapps/Downloads/obsidian
```

### 2. Configuration

Set in `opencode.json`:
```json
{
  "obsidian": {
    "vault_path": "/Users/souliyapps/Downloads/obsidian",
    "auto_save": true,
    "folder": "OpenCode"
  }
}
```

## File Structure

```
Obsidian/
└── OpenCode/
    ├── 00-Inbox/              # New prompts (auto-saved)
    │   ├── 2026-07-21-10-30-create-ecommerce.md
    │   └── 2026-07-21-11-15-fix-auth-bug.md
    │
    ├── 01-Patterns/           # Learned patterns
    │   ├── php-mvc-pattern.md
    │   ├── react-hooks.md
    │   └── mysql-queries.md
    │
    ├── 02-Projects/           # Project documentation
    │   ├── ecommerce/
    │   │   ├── README.md
    │   │   ├── architecture.md
    │   │   └── api-reference.md
    │   └── pos-system/
    │
    ├── 03-Knowledge/          # General knowledge
    │   ├── php/
    │   ├── javascript/
    │   └── database/
    │
    ├── 04-Sessions/           # Session history
    │   ├── 2026-07-21.md
    │   └── 2026-07-20.md
    │
    └── 05-Templates/          # Note templates
        ├── prompt-template.md
        └── session-template.md
```

## Auto-Save Prompts

Every prompt is automatically saved to Obsidian:

```markdown
---
date: 2026-07-21T10:30:00
type: prompt
project: ecommerce
tags: [php, backend, api]
---

# Create E-commerce API

## Prompt
Create a REST API for e-commerce with products, orders, and users.

## Response
Created complete API with:
- ProductController with CRUD
- OrderController with transactions
- UserController with auth
- MySQL schema with migrations

## Code Snippets
```php
// ProductController@store
public function store(): void {
    // ...
}
```

## Learned Patterns
- Used PDO Singleton (confidence: 95%)
- Used method-chain routing (confidence: 90%)

## Links
- [[php-backend]]
- [[mysql-database]]
- [[ecommerce-project]]
```

## Save Patterns

When self-improve learns a pattern, save to Obsidian:

```markdown
---
date: 2026-07-21
type: pattern
category: php
tags: [database, pdo, singleton]
confidence: 0.95
---

# PDO Singleton Pattern

## Description
Database connection using PDO singleton with static method.

## Code
```php
final class Database
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }
        // ...
    }
}
```

## Usage
```php
$pdo = Database::pdo();
```

## Projects Using This
- [[land-houses-dev]]
- [[thiengtham-dev]]
- [[buddhaword]]

## Related
- [[mysql-queries]]
- [[php-mvc-pattern]]
```

## Session History

Each session creates a daily note:

```markdown
---
date: 2026-07-21
type: session
prompts: 15
duration: 2h 30m
---

# Session: 2026-07-21

## Summary
- Created e-commerce backend
- Fixed authentication bug
- Optimized MySQL queries

## Prompts
1. [[2026-07-21-10-30-create-ecommerce]] - Create API
2. [[2026-07-21-11-15-fix-auth-bug]] - Fix login
3. [[2026-07-21-12-00-optimize-queries]] - Optimize DB

## Patterns Used
- PDO Singleton (100% confidence)
- Transaction pattern (95% confidence)
- JWT auth (90% confidence)

## Mistakes & Corrections
- Forgot to add transaction for order creation → Added rollback

## Learning Points
- Always use transactions for multi-table operations
- Add indexes for frequently queried columns
```

## Query Memory

Search your Obsidian vault:

```bash
# Find all PHP patterns
.obsidian-memory search "php" --tag pattern

# Find prompts about authentication
.obsidian-memory search "auth" --type prompt

# Find recent sessions
.obsidian-memory sessions --recent 7

# Get pattern by name
.obsidian-memory get "pdo-singleton"
```

## Knowledge Graph

Obsidian creates connections between notes:

```
[Create E-commerce API]
    ├── [[php-backend]] (used)
    ├── [[mysql-database]] (used)
    ├── [[pdo-singleton]] (pattern)
    ├── [[transaction-pattern]] (pattern)
    └── [[ecommerce-project]] (project)

[pdo-singleton]
    ├── [[land-houses-dev]] (source)
    ├── [[thiengtham-dev]] (source)
    ├── [[php-backend]] (used by)
    └── [[mysql-database]] (related)
```

## Commands

```
/obsidian-save <type> <content>  # Save to vault
/obsidian-search <query>         # Search vault
/obsidian-patterns               # List patterns
/obsidian-sessions               # List sessions
/obsidian-links                  # Show knowledge graph
/obsidian-sync                   # Sync with vault
```

## Integration

- **self-improve**: Patterns saved to Obsidian
- **prompt-history**: All prompts saved
- **function-memory**: Function calls logged
- **full-stack-flow**: Project docs saved
- **php-backend**: PHP patterns saved
- **mysql-database**: SQL patterns saved

## Notes

- Uses Obsidian-flavored Markdown
- Supports YAML frontmatter
- Creates [[wiki-links]] for connections
- Tags with #hashtags
- Supports daily notes structure
- Auto-creates folder structure
