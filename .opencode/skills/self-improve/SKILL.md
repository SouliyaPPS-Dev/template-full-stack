---
name: self-improve
description: Self-improvement system that learns from Hermes agent capabilities. Analyzes code patterns, learns from mistakes, and evolves coding style over time. Use when wanting to improve agent capabilities, learn from previous sessions, or evolve coding patterns. Triggers on: improve, learn, evolve, better, smarter.
---

# Self-Improve - Hermes Learning System

Continuous learning and improvement system powered by Hermes AI.

## Purpose

Make agents **smarter over time** by:
- Learning from your code patterns (from htdocs projects)
- Analyzing successful solutions
- Remembering what works and what doesn't
- Evolving coding style based on your preferences

## Learning Sources

### 1. Your Existing Code Patterns

From `/Applications/XAMPP/xamppfiles/htdocs/`:

| Pattern | Source Project | What to Learn |
|---------|---------------|---------------|
| Custom MVC | land-houses-dev | Router, Database, Env patterns |
| PDO Singleton | All projects | Database connection style |
| API Pattern | All projects | JSON endpoint structure |
| Frontend | All projects | Tailwind + Alpine.js stack |
| Auth | BaseController | Session-based authentication |
| Transactions | rent-miss-clean | Multi-table operations |
| PWA | All modern | Service Worker patterns |

### 2. Hermes Function Calling

Hermes excels at:
- Structured JSON outputs
- Tool use and function calling
- Reasoning chains
- Code generation with constraints

### 3. Prompt History Analysis

Every prompt you send is analyzed for:
- What worked well
- What failed
- Patterns in your requests
- Preferred solutions

## Learning Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    SELF-IMPROVEMENT LOOP                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. OBSERVE                                                 │
│     │  - Scan your code patterns                            │
│     │  - Analyze prompt history                             │
│     │  - Track successful solutions                         │
│     ▼                                                       │
│  2. LEARN                                                   │
│     │  - Extract coding patterns                            │
│     │  - Identify preferences                               │
│     │  - Build pattern library                              │
│     ▼                                                       │
│  3. APPLY                                                   │
│     │  - Use learned patterns in new code                   │
│     │  - Suggest improvements                               │
│     │  - Auto-complete based on style                       │
│     ▼                                                       │
│  4. REFLECT                                                 │
│     │  - Did the suggestion work?                           │
│     │  - Was the pattern correct?                           │
│     │  - Update pattern weights                             │
│     ▼                                                       │
│  5. EVOLVE                                                  │
│        - Update pattern library                             │
│        - Refine coding style                                │
│        - Improve over time                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Storage

Patterns stored in: `.opencode/memory/patterns.json`

```json
{
  "php_patterns": {
    "database": {
      "pattern": "PDO Singleton with static pdo() method",
      "confidence": 0.95,
      "source": "land-houses-dev",
      "last_used": "2026-07-21"
    },
    "routing": {
      "pattern": "Method-chain with named parameters",
      "confidence": 0.90,
      "source": "land-houses-dev"
    }
  },
  "frontend_patterns": {
    "styling": {
      "pattern": "Tailwind CSS via CDN",
      "confidence": 0.98
    },
    "reactivity": {
      "pattern": "Alpine.js",
      "confidence": 0.95
    }
  },
  "learned_preferences": {
    "language": "Lao (primary), English, Thai",
    "framework": "Custom MVC",
    "database": "MySQL via PDO"
  }
}
```

## Commands

```
/self-improve scan          # Scan code patterns from htdocs
/self-improve learn         # Extract patterns from recent session
/self-improve show          # Show learned patterns
/self-improve apply <task>  # Apply patterns to new task
/self-improve evolve        # Run improvement cycle
```

## Integration

- **hermes-agent**: Uses Hermes for pattern analysis
- **function-memory**: Stores successful patterns
- **obsidian-memory**: Exports learnings to Obsidian
- **prompt-history**: Analyzes prompt patterns
- **full-stack-flow**: Uses learned patterns for code generation

## Example

```
User: /self-improve scan

Agent: Scanning your PHP projects...

Found 7 projects with patterns:
- Custom MVC framework (5 projects)
- CodeIgniter 3 (2 legacy projects)

Extracting patterns...

Pattern Library Updated:
✓ Database: PDO Singleton (confidence: 95%)
✓ Routing: Method-chain (confidence: 90%)
✓ Frontend: Tailwind + Alpine.js (confidence: 98%)
✓ Auth: Session-based (confidence: 95%)

Next: /self-improve learn to analyze recent session
```

## How It Improves Over Time

1. **Session 1**: Learns your basic patterns
2. **Session 2**: Applies patterns, you correct mistakes
3. **Session 3**: Patterns refined, fewer corrections needed
4. **Session N**: Near-perfect code generation matching your style

The system gets smarter with every interaction.
