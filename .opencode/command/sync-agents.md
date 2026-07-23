---
description: Auto-sync AGENTS.md to Obsidian + OpenCode memory + Hermes memory
---

When AGENTS.md is updated, automatically sync to all memory systems.

## Sync Targets

1. **Obsidian Vault**: `/Users/souliyapps/Downloads/obsidian/OpenCode/`
2. **OpenCode Memory**: `.opencode/memory/`
3. **Hermes Memory**: `.opencode/memory/hermes-context.json`

## Execution

Read `AGENTS.md` and distribute content:

### 1. Obsidian Project Doc
Write full content to: `02-Projects/full-stack-template-complete.md`
- Include frontmatter: date, type: project, tags
- Full PostgreSQL schema
- Full MySQL reference schemas
- Pattern comparison table
- Tech stack summary

### 2. Obsidian Knowledge
Write to: `03-Knowledge/database-patterns-comparison.md`
Write to: `03-Knowledge/tech-stack-reference.md`
Write to: `03-Knowledge/php-xampp-projects.md`

### 3. Obsidian Patterns
Write to: `01-Patterns/pdo-singleton-pattern.md`
Write to: `01-Patterns/postgresql-schema-pattern.md`

### 4. OpenCode Memory
Update: `.opencode/memory/project-context.json`
Update: `.opencode/memory/agents-md-hash.json` (track last sync)

### 5. Hermes Memory
Update: `.opencode/memory/hermes-context.json`
- Project structure
- Database schemas (PG + MySQL)
- Tech stack
- Code standards
- Commands

## Auto-Trigger

This command runs automatically when:
- User edits AGENTS.md
- User types `/sync-agents`
- Start of new session (check if hash changed)
