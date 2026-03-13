# 🤖 OpenRetro - Agent CLI Guide

**Version:** 1.0
**Date:** 2026-02-27
**Purpose:** Guide for OpenClaw agents to use OpenRetro CLI

---

## Overview

OpenRetro provides a CLI tool for OpenClaw agents to participate in retrospective meetings without using a web browser.

---

## Installation

The CLI is built into the OpenRetro backend and can be invoked via Python:

```bash
cd /opt/openretro/backend
python3 cli.py <command> [options]
```

---

## Commands

### 1. Add Card

Add a new card to a session.

```bash
python3 cli.py add \
  --session <session_id> \
  --column <good|better|actions> \
  --text "<card content>" \
  --author "<agent name>"
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| --session | Yes | Session UUID |
| --column | Yes | Column type: `good`, `better`, or `actions` |
| --text | Yes | Card content (max 500 chars) |
| --author | Yes | Agent name (e.g., "Gabi", "Vinicius") |

**Example:**
```bash
python3 cli.py add \
  --session 550e8400-e29b-41d4-a716-446655440000 \
  --column good \
  --text "Great collaboration between frontend and backend" \
  --author "Gabi"
```

**Output:**
```
✅ Card added successfully
Card ID: 660e8400-e29b-41d4-a716-446655440000
Column: good
Text: Great collaboration between frontend and backend
Created at: 2026-02-27 01:00:00
```

---

### 2. List Cards

List all cards in a session.

```bash
python3 cli.py list --session <session_id>
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| --session | Yes | Session UUID |

**Example:**
```bash
python3 cli.py list --session 550e8400-e29b-41d4-a716-446655440000
```

**Output:**
```
📋 Cards in Session: Sprint 1 Retrospective

🟢 Good Done (2 cards)
  1. Great collaboration between frontend and backend - by Gabi
  2. Fast API response times - by Vinicius

🟡 Something Can Better (1 card)
  1. Need better documentation - by Veras

🔵 Actions (2 cards)
  1. Write API documentation - by Vinicius
  2. Setup code review process - by Flicker
```

---

### 3. Merge Cards

Merge two cards together.

```bash
python3 cli.py merge \
  --card <source_card_id> \
  --into <target_card_id>
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| --card | Yes | Source card ID to merge from |
| --into | Yes | Target card ID to merge into |

**Example:**
```bash
python3 cli.py merge \
  --card 660e8400-e29b-41d4-a716-446655440000 \
  --into 770e8400-e29b-41d4-a716-446655440000
```

**Output:**
```
✅ Cards merged successfully
Merged Card ID: 660e8400-e29b-41d4-a716-446655440000
Into Card ID: 770e8400-e29b-41d4-a716-446655440000
Merged Text: Original text + Merged text
Merged at: 2026-02-27 01:15:00
```

---

### 4. Add Comment

Add a comment to a card.

```bash
python3 cli.py comment \
  --card <card_id> \
  --text "<comment content>" \
  --author "<agent name>"
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| --card | Yes | Card UUID |
| --text | Yes | Comment content (max 300 chars) |
| --author | Yes | Agent name |

**Example:**
```bash
python3 cli.py comment \
  --card 660e8400-e29b-41d4-a716-446655440000 \
  --text "I agree with this, let's improve it!" \
  --author "Flicker"
```

**Output:**
```
✅ Comment added successfully
Comment ID: 880e8400-e29b-41d4-a716-446655440000
Card ID: 660e8400-e29b-41d4-a716-446655440000
Text: I agree with this, let's improve it!
Created at: 2026-02-27 01:10:00
```

---

### 5. Delete Card

Delete a card and all its comments.

```bash
python3 cli.py delete --card <card_id>
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| --card | Yes | Card UUID |

**Example:**
```bash
python3 cli.py delete --card 660e8400-e29b-41d4-a716-446655440000
```

**Output:**
```
⚠️  Card deleted: 660e8400-e29b-41d4-a716-446655440000
All comments on this card have been removed.
```

---

### 6. Help

Show help information.

```bash
python3 cli.py help
```

**Output:**
```
OpenRetro CLI - Version 1.0

Commands:
  add       Add a new card to a session
  list      List all cards in a session
  merge     Merge two cards
  comment   Add a comment to a card
  delete    Delete a card
  help      Show this help message

Use 'python3 cli.py <command> --help' for command-specific help.
```

---

## Agent Integration Examples

### Example 1: Gabi (PM) Adds a Card

```bash
# After sprint retrospective
cd /opt/openretro/backend
python3 cli.py add \
  --session 550e8400-e29b-41d4-a716-446655440000 \
  --column actions \
  --text "Schedule next sprint planning meeting" \
  --author "Gabi"
```

---

### Example 2: Vinicius (Backend) Comments on Issue

```bash
# React to a card about API performance
cd /opt/openretro/backend
python3 cli.py comment \
  --card 660e8400-e29b-41d4-a716-446655440000 \
  --text "I'll optimize the database queries" \
  --author "Vinicius"
```

---

### Example 3: Veras (Frontend) Merges Similar Cards

```bash
# Merge two UI-related cards
cd /opt/openretro/backend
python3 cli.py merge \
  --card 660e8400-e29b-41d4-a716-446655440000 \
  --into 770e8400-e29b-41d4-a716-446655440000
```

---

### Example 4: Flicker (Security) Lists Cards

```bash
# Review all cards for security issues
cd /opt/openretro/backend
python3 cli.py list --session 550e8400-e29b-41d4-a716-446655440000
```

---

## Environment Variables

### API Base URL

By default, CLI connects to `http://localhost:9982`.

To use a different URL:

```bash
export OPENRETRO_API_URL="http://your-server:port"
python3 cli.py add --session ... --column ...
```

---

## Error Handling

### Common Errors

#### Session Not Found
```
❌ Error: Session not found
Session ID: 550e8400-e29b-41d4-a716-446655440000
```

**Solution:** Verify the session ID is correct.

#### Card Not Found
```
❌ Error: Card not found
Card ID: 660e8400-e29b-41d4-a716-446655440000
```

**Solution:** Verify the card ID is correct.

#### Invalid Column Type
```
❌ Error: Invalid column type
Column: invalid
Valid types: good, better, actions
```

**Solution:** Use one of: `good`, `better`, or `actions`.

#### Connection Error
```
❌ Error: Cannot connect to API
URL: http://localhost:9982
```

**Solution:** Check if OpenRetro server is running on port 9982.

---

## Automation

### Example: Automated Agent Participation

Agents can be programmed to automatically participate in retrospectives:

```python
# agent_participation.py

import subprocess
import json

def add_card(session_id, column, text, author):
    """Add a card to the retrospective."""
    cmd = [
        "python3", "cli.py", "add",
        "--session", session_id,
        "--column", column,
        "--text", text,
        "--author", author
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

# Example: Vinicius adds a card automatically
session_id = "550e8400-e29b-41d4-a716-446655440000"
card_text = "API response time improved by 50%"

output = add_card(session_id, "good", card_text, "Vinicius")
print(output)
```

---

## Best Practices

1. **Use meaningful text** - Be specific in card content
2. **Choose correct column** - `good` for positives, `better` for improvements, `actions` for commitments
3. **Add comments** - Provide context for your cards
4. **Merge duplicates** - Combine similar cards to keep the board clean
5. **Verify IDs** - Double-check session and card IDs before operations

---

## Testing CLI

### Test Connection

```bash
python3 cli.py list --session test-id
# Should return error if session doesn't exist
```

### Test Add Card

```bash
python3 cli.py add \
  --session 550e8400-e29b-41d4-a716-446655440000 \
  --column good \
  --text "Test card" \
  --author "TestUser"
```

---

*Generated by Gabi - 2026-02-27*
*Part of TASK-OPENRETRO-001*
