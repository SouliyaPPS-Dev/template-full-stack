---
name: function-memory
description: Stores and retrieves function call history, parameters, and results for persistent context across sessions. Use when needing to remember previous function calls, avoid redundant API calls, or maintain conversation context.
---

# Function Memory

Persistent memory system for function calls and their results.

## Purpose

- Store function call history with timestamps
- Retrieve previous results to avoid redundant calls
- Maintain context across sessions
- Cache expensive API responses

## Usage

### Store a Function Call

When you make an important function call, store it:

```
/function-memory store <function_name> <params_json> <result_json>
```

### Retrieve Previous Calls

Look up cached results:

```
/function-memory retrieve <function_name> <optional_params_filter>
```

### List All Stored Functions

```
/function-memory list
```

### Clear Old Entries

```
/function-memory clear --older-than 7d
```

## Storage Location

Memory is stored in `.opencode/memory/function-calls.json`

## Integration with Hermes

Hermes models excel at function calling. Use this memory to:
1. Cache Hermes function call results
2. Avoid re-executing identical tool calls
3. Provide context from previous interactions

## Integration with TRAE

TRAE's Doubao models support reasoning. Use memory to:
1. Store reasoning chains
2. Cache code generation results
3. Maintain project context
