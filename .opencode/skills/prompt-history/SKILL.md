---
name: prompt-history
description: Saves and analyzes all prompt history from OpenCode sessions. Tracks what works, learns from mistakes, and improves over time. Use when reviewing prompt history, analyzing patterns, or learning from past sessions. Triggers on: history, prompts, past, previous, sessions, learn.
---

# Prompt History - Learning Loop

Complete prompt history tracking and learning system.

## Purpose

Save every prompt and response to:
- Learn what works and what doesn't
- Track your coding patterns
- Improve agent responses over time
- Build a knowledge base of solutions

## Storage

### Local Storage

```
.opencode/memory/
├── prompts/
│   ├── 2026-07-21.jsonl        # Daily prompts (JSON Lines)
│   └── 2026-07-20.jsonl
├── patterns/
│   ├── successful.json         # Patterns that worked
│   └── failed.json            # Patterns that failed
├── stats/
│   ├── daily.json             # Daily statistics
│   └── weekly.json           # Weekly statistics
└── learning/
    ├── improvements.json      # What improved over time
    └── corrections.json       # Mistakes and fixes
```

### Obsidian Sync

All prompts also saved to Obsidian vault (see obsidian-memory skill).

## Prompt Format

Every prompt is saved as:

```json
{
  "id": "prm-" + bin2hex(random_bytes(16)),
  "timestamp": "2026-07-21T10:30:00Z",
  "session_id": "ses-abc123",
  "prompt": "Create a REST API for e-commerce",
  "response_summary": "Created ProductController with CRUD operations",
  "success": true,
  "patterns_used": ["pdo-singleton", "method-chain-router"],
  "corrections": [],
  "duration_ms": 5000,
  "tokens_used": 1500,
  "model": "anthropic/claude-sonnet-4-20250514",
  "tags": ["php", "api", "ecommerce"],
  "project": "ecommerce",
  "learning_points": [
    "Always use transactions for multi-table operations"
  ]
}
```

## Learning Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT LEARNING LOOP                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CAPTURE                                                 │
│     │  - Save prompt text                                   │
│     │  - Save response summary                              │
│     │  - Track success/failure                              │
│     ▼                                                       │
│  2. ANALYZE                                                 │
│     │  - What patterns were used?                           │
│     │  - Were corrections needed?                           │
│     │  - How long did it take?                              │
│     ▼                                                       │
│  3. LEARN                                                   │
│     │  - Update pattern confidence                          │
│     │  - Record successful solutions                        │
│     │  - Note mistakes to avoid                             │
│     ▼                                                       │
│  4. IMPROVE                                                 │
│     │  - Next time, use learned patterns                    │
│     │  - Suggest better approaches                          │
│     │  - Auto-complete based on history                     │
│     ▼                                                       │
│  5. EVOLVE                                                  │
│        - Agent gets smarter over time                       │
│        - Fewer corrections needed                          │
│        - Faster, better responses                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Statistics Tracked

### Daily Stats

```json
{
  "date": "2026-07-21",
  "total_prompts": 45,
  "successful": 42,
  "failed": 3,
  "success_rate": 0.93,
  "avg_duration_ms": 4500,
  "total_tokens": 67500,
  "patterns_used": {
    "pdo-singleton": 15,
    "method-chain-router": 12,
    "transaction-pattern": 8
  },
  "corrections": [
    {
      "prompt_id": "prm-abc123",
      "correction": "Forgot to add transaction",
      "lesson": "Always use transactions for multi-table operations"
    }
  ]
}
```

### Pattern Confidence

```json
{
  "pdo-singleton": {
    "uses": 45,
    "successes": 43,
    "failures": 2,
    "confidence": 0.96,
    "last_used": "2026-07-21",
    "source": "land-houses-dev"
  },
  "method-chain-router": {
    "uses": 38,
    "successes": 37,
    "failures": 1,
    "confidence": 0.97,
    "last_used": "2026-07-21",
    "source": "land-houses-dev"
  }
}
```

## Query History

### Recent Prompts

```bash
# Last 10 prompts
.obsidian-memory prompts --recent 10

# Prompts from today
.obsidian-memory prompts --date today

# Prompts about PHP
.obsidian-memory prompts --tag php

# Successful prompts only
.obsidian-memory prompts --success true

# Failed prompts (to learn from)
.obsidian-memory prompts --success false
```

### Search History

```bash
# Find prompts about authentication
.obsidian-memory search "auth"

# Find prompts using PDO
.obsidian-memory search "pdo" --tag php

# Find prompts for specific project
.obsidian-memory search --project ecommerce
```

### Statistics

```bash
# Daily stats
.obsidian-memory stats --daily

# Weekly stats
.obsidian-memory stats --weekly

# Pattern usage
.obsidian-memory stats --patterns

# Success rate over time
.obsidian-memory stats --trend
```

## Learning Features

### Pattern Recognition

When you send a prompt, the system:
1. Analyzes the request
2. Matches against known patterns
3. Suggests proven solutions
4. Warns about past mistakes

### Auto-Suggestions

Based on history, suggest:
- "Last time you created a PHP API, you used PDO Singleton. Want me to use that pattern?"
- "You had issues with transactions before. Should I add error handling?"
- "This pattern has 95% success rate. Want to use it?"

### Mistake Prevention

Before generating code, check:
- "You forgot transactions last time. Should I add them?"
- "Pattern X failed 3 times. Consider using pattern Y instead."

## Commands

```
/prompt-history show              # Show recent prompts
/prompt-history search <query>    # Search history
/prompt-history stats             # Show statistics
/prompt-history patterns          # Show pattern usage
/prompt-history learn             # Extract learnings
/prompt-history export            # Export to Obsidian
```

## Integration

- **self-improve**: Uses history for learning
- **obsidian-memory**: Syncs to Obsidian vault
- **function-memory**: Tracks function calls
- **hermes-agent**: Uses Hermes for analysis
- **full-stack-flow**: Applies learned patterns

## Export to Obsidian

All prompts automatically exported to Obsidian:

```
OpenCode/
├── 00-Inbox/
│   ├── 2026-07-21-10-30-create-api.md
│   └── 2026-07-21-11-15-fix-auth.md
├── 04-Sessions/
│   └── 2026-07-21.md
└── 01-Patterns/
    └── pdo-singleton.md
```

## Notes

- Every prompt is saved (with your consent)
- Patterns are extracted automatically
- Learning happens in the background
- Gets smarter with every session
- Export to Obsidian for permanent storage
