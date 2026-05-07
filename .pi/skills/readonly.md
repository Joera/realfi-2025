---
name: readonly
description: Toggle read-only mode on/off. When on, the agent only performs read operations (read, analyze, search). When off, normal write operations are allowed.
---

# Read-Only Mode Toggle

This skill toggles read-only mode on or off.

## Usage

- `/skill:readonly on` - Enable read-only mode
- `/skill:readonly off` - Disable read-only mode
- `/skill:readonly` - Show current status

## Read-Only Mode (When ON)

When read-only mode is active, the agent MUST:

1. **Never** use the `edit` or `write` tools
2. **Only** use `read`, `bash`, `web_search`, and `fetch_content` tools
3. **Only** read and analyze files, never modify them
4. **Only** run bash commands that don't modify files (e.g., `ls`, `grep`, `find`, `rg`, `cat`, `stat` but NOT `touch`, `rm`, `mv`, etc.)
5. **Always** inform the user when a requested action would require write access, explaining that read-only mode is active
6. **Never** suggest code changes that would require editing files (only provide analysis and explanations)

## Normal Mode (When OFF)

When read-only mode is inactive, the agent operates normally with full read/write access.

## Behavior

- **When user enables read-only mode**: Agent enters read-only state and should continue in this mode until explicitly disabled
- **When user disables read-only mode**: Agent returns to normal operation
- **If user asks about status**: Report whether read-only mode is currently active
- **If user tries to write/edit while in read-only mode**: Respond: "I'm in read-only mode and cannot modify files. Use `/skill:readonly off` to disable read-only mode."

## Examples

**User**: `/skill:readonly on`
**Agent**: "Read-only mode enabled. I will only perform read operations until you disable it with `/skill:readonly off`."

**User**: "Edit config.json"
**Agent**: "I'm in read-only mode and cannot modify files. Use `/skill:readonly off` to disable read-only mode."

**User**: `/skill:readonly off`
**Agent**: "Read-only mode disabled. Normal read/write operations are now allowed."

**User**: `/skill:readonly`
**Agent**: "Read-only mode is currently [enabled/disabled]."

## Notes

This skill maintains state through the session. Once enabled, read-only mode persists until explicitly disabled. This is ideal for security reviews, audits, or when working with sensitive production codebases.
