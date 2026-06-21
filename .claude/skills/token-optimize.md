# Token Optimization Skill

Use this skill when the user asks to optimize tokens, reduce context size, compress prompts, summarize for handoff, or prepare context for another tool session.

## What this does

Analyzes the current conversation context, working files, or a specified block of text and produces a token-optimized summary that preserves:
- Critical decisions made
- File paths and line numbers referenced
- Code changes (as diffs, not full files)
- Unresolved questions or blockers
- Architecture/design constraints discovered

## Instructions

When invoked, follow these steps:

### 1. Identify scope

Ask yourself: what does the user need to carry forward? Default to the full session context unless they specify a subset.

### 2. Extract structured context

Produce output in this format:

```
## Session Context (Token-Optimized)

**Project**: <repo name and primary language>
**Branch**: <current branch>
**Goal**: <one-sentence task summary>

### Decisions
- <decision 1>
- <decision 2>

### Files Modified
- `path/to/file:line` — <what changed and why>

### Key Findings
- <finding that would be expensive to re-derive>

### Open Items
- <unresolved question or next step>

### Constraints
- <architectural or business constraint>

### Handoff Command
<A single copy-paste prompt the user can give to another Claude Code session or tool>
```

### 3. Compression heuristics

Apply these rules to minimize tokens:
- Replace full file contents with path + line range + one-line description
- Replace repeated patterns with "N occurrences of X pattern in Y"
- Drop exploratory dead-ends unless they inform a constraint
- Use diff notation for code changes (not before/after blocks)
- Collapse sequential reasoning into conclusions only
- Omit tool invocations — state results, not the commands that produced them

### 4. Estimate savings

Report approximate token counts:
- Original context: ~N tokens
- Optimized handoff: ~M tokens
- Compression ratio: X:1

### 5. Generate handoff formats

Provide the optimized context in two formats:
1. **Clipboard format** — plain text the user can paste into another tool
2. **File format** — saved to `.claude/context-snapshots/<timestamp>.md` for later retrieval

## Usage Examples

- `/token-optimize` — optimize entire session
- `/token-optimize last 5 messages` — optimize recent context only
- `/token-optimize for codex` — format for OpenAI Codex CLI handoff
- `/token-optimize for cursor` — format for Cursor IDE context
- `/token-optimize for claude-code` — format for a new Claude Code session
