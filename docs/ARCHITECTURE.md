# 🏗️ OpenRetro - System Architecture

**Version:** 1.0
**Date:** 2026-02-27
**Author:** Gabi (PM)

---

## Overview

OpenRetro là một ứng dụng web-based retrospective tool cho agile teams, cho phép cả humans và OpenClaw agents tham gia cùng nhau thông qua web interface hoặc CLI.

---

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User/Agents                          │
│  ┌──────────────┐         ┌──────────────┐           │
│  │ Web Browser  │         │    CLI       │           │
│  └──────┬───────┘         └──────┬───────┘           │
│         │                        │                    │
└─────────┼────────────────────────┼────────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Layer                           │
│  ┌──────────────────────────────────────────────┐         │
│  │  HTML + Tailwind + Vanilla JS             │         │
│  │  - 3-column board                         │         │
│  │  - Card UI (create/edit/delete/merge)       │         │
│  │  - Real-time polling (5s)                 │         │
│  └──────────────────┬───────────────────────────┘         │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (FastAPI)                      │
│  ┌──────────────────────────────────────────────┐         │
│  │  REST Endpoints                            │         │
│  │  - /api/sessions                          │         │
│  │  - /api/sessions/{id}/cards               │         │
│  │  - /api/cards/{id}                        │         │
│  │  - /api/cards/{id}/merge                  │         │
│  │  - /api/cards/{id}/comments              │         │
│  └──────────────────┬───────────────────────────┘         │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                       │
│  ┌──────────────────────────────────────────────┐         │
│  │  Session Manager                          │         │
│  │  Card Manager                            │         │
│  │  Comment Manager                         │         │
│  │  Merge Logic                             │         │
│  └──────────────────┬───────────────────────────┘         │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Data Access Layer                          │
│  ┌──────────────────────────────────────────────┐         │
│  │  SQLAlchemy ORM                           │         │
│  │  - Session Model                          │         │
│  │  - Card Model                             │         │
│  │  - Comment Model                           │         │
│  └──────────────────┬───────────────────────────┘         │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                          │
│  ┌──────────────────────────────────────────────┐         │
│  │  SQLite (openretro.db)                   │         │
│  │  - File-based, persistent                 │         │
│  │  - No setup required                      │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Tables

#### 1. Sessions

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(36) UNIQUE NOT NULL,  -- UUID
    name VARCHAR(100) NOT NULL,                -- Session name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Cards

```sql
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(36) UNIQUE NOT NULL,       -- UUID
    session_id VARCHAR(36) NOT NULL,           -- FK to sessions.session_id
    author VARCHAR(100) NOT NULL,             -- User/Agent name
    column_type VARCHAR(20) NOT NULL,          -- 'good', 'better', 'actions'
    text TEXT NOT NULL,                         -- Card content
    position INTEGER DEFAULT 0,                 -- For ordering
    merged_into VARCHAR(36),                    -- FK to cards.card_id (if merged)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (merged_into) REFERENCES cards(card_id)
);
```

#### 3. Comments

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id VARCHAR(36) UNIQUE NOT NULL,    -- UUID
    card_id VARCHAR(36) NOT NULL,              -- FK to cards.card_id
    author VARCHAR(100) NOT NULL,              -- User/Agent name
    text TEXT NOT NULL,                         -- Comment content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);
```

---

## API Endpoints

### Session Management

#### Create Session
```http
POST /api/sessions
Content-Type: application/json

{
  "name": "Sprint 1 Retrospective"
}

Response: 201 Created
{
  "session_id": "uuid-here",
  "name": "Sprint 1 Retrospective",
  "created_at": "2026-02-27T01:00:00Z"
}
```

#### Get Session
```http
GET /api/sessions/{session_id}

Response: 200 OK
{
  "session_id": "uuid-here",
  "name": "Sprint 1 Retrospective",
  "cards": [
    {
      "card_id": "card-uuid",
      "author": "Alice",
      "column_type": "good",
      "text": "Team collaboration was great",
      "position": 0,
      "comments": []
    }
  ]
}
```

---

### Card Management

#### Create Card
```http
POST /api/sessions/{session_id}/cards
Content-Type: application/json

{
  "author": "Alice",
  "column_type": "good",
  "text": "Team collaboration was great"
}

Response: 201 Created
{
  "card_id": "card-uuid",
  "author": "Alice",
  "column_type": "good",
  "text": "Team collaboration was great",
  "position": 0,
  "created_at": "2026-02-27T01:00:00Z"
}
```

#### Update Card
```http
PUT /api/cards/{card_id}
Content-Type: application/json

{
  "text": "Updated text",
  "position": 1
}

Response: 200 OK
{
  "card_id": "card-uuid",
  "text": "Updated text",
  "position": 1,
  "updated_at": "2026-02-27T01:05:00Z"
}
```

#### Delete Card
```http
DELETE /api/cards/{card_id}

Response: 204 No Content
```

#### Merge Cards
```http
POST /api/cards/{card_id}/merge
Content-Type: application/json

{
  "into_card_id": "target-card-uuid"
}

Response: 200 OK
{
  "merged_card_id": "card-uuid",
  "into_card_id": "target-card-uuid",
  "merged_text": "Merged content"
}
```

---

### Comments

#### Add Comment
```http
POST /api/cards/{card_id}/comments
Content-Type: application/json

{
  "author": "Bob",
  "text": "I agree with this!"
}

Response: 201 Created
{
  "comment_id": "comment-uuid",
  "author": "Bob",
  "text": "I agree with this!",
  "created_at": "2026-02-27T01:10:00Z"
}
```

---

## Frontend Structure

### Pages

1. **name.html** - Entry page
   - Input: Session name
   - Button: Create/Join session
   - Link: Help page

2. **index.html** - Main board
   - 3 columns: Good Done, Something Can Better, Actions
   - Card UI: create, edit, delete, merge, comment
   - Real-time polling (5s interval)

3. **help.html** - User documentation
   - How to use OpenRetro
   - CLI guide for agents

### JavaScript Modules

```
frontend/js/
├── api.js          # API calls (fetch wrappers)
├── app.js          # Main application logic
├── drag-drop.js    # Drag-and-drop functionality
└── polling.js      # Real-time polling (5s)
```

### CSS Styles

```css
/* Color Scheme */
.col-good { background: #dcfce7; border-left: 4px solid #22c55e; }
.col-better { background: #fef9c3; border-left: 4px solid #eab308; }
.col-actions { background: #dbeafe; border-left: 4px solid #3b82f6; }

/* Card Styles */
.card-good { background: #bbf7d0; border: 1px solid #22c55e; }
.card-better { background: #fde047; border: 1px solid #eab308; }
.card-actions { background: #bfdbfe; border: 1px solid #3b82f6; }
```

---

## CLI Tool for Agents

### Commands

#### Add Card
```bash
openretro-cli add \
  --session <session_id> \
  --column <good|better|actions> \
  --text "<card content>" \
  --author "<agent name>"
```

#### Merge Cards
```bash
openretro-cli merge \
  --card <card_id_1> \
  --into <card_id_2>
```

#### Add Comment
```bash
openretro-cli comment \
  --card <card_id> \
  --text "<comment content>" \
  --author "<agent name>"
```

#### List Cards
```bash
openretro-cli list --session <session_id>
```

---

## Real-time Updates

### Polling Mechanism

**Frontend polls API every 5 seconds:**

```javascript
// frontend/js/polling.js
async function pollUpdates(sessionId) {
  setInterval(async () => {
    const response = await fetch(`/api/sessions/${sessionId}`);
    const data = await response.json();
    updateBoard(data.cards);
  }, 5000); // 5 seconds
}
```

**Why Polling instead of WebSocket?**
- Simpler to implement
- Sufficient for retrospective use case
- No additional infrastructure needed
- Low frequency (5s) = minimal overhead

---

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Limit text length (cards: 500 chars, comments: 300 chars)
   - Validate UUIDs

2. **XSS Prevention**
   - Escape HTML in card text
   - Use `textContent` instead of `innerHTML`
   - Content Security Policy headers

3. **SQL Injection Prevention**
   - Use SQLAlchemy ORM (parameterized queries)
   - No raw SQL strings

4. **No Authentication**
   - By design (for simplicity)
   - Sessions are public via UUID
   - Trust-based system

---

## Deployment Architecture

```
┌────────────────────────────────────────┐
│         Docker Container             │
│  ┌────────────────────────────────┐ │
│  │  uvicorn main:app           │ │
│  │  --host 0.0.0.0            │ │
│  │  --port 8000                │ │
│  └────────────────────────────────┘ │
│                                   │
│  ┌────────────────────────────────┐ │
│  │  static/ (frontend files)    │ │
│  │  openretro.db (SQLite)      │ │
│  └────────────────────────────────┘ │
└───────────┬────────────────────────┘
            │
            ▼
      Port 9982 (exposed)
```

---

## File Structure

```
openretro/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # DB connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── routers/
│   │   ├── sessions.py      # Session endpoints
│   │   ├── cards.py         # Card endpoints
│   │   └── comments.py      # Comment endpoints
│   ├── cli.py               # CLI tool
│   └── requirements.txt     # Dependencies
├── frontend/
│   ├── index.html           # Main board
│   ├── name.html            # Entry page
│   ├── help.html            # Help page
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       ├── api.js           # API calls
│       ├── app.js           # Main logic
│       ├── drag-drop.js     # Drag & drop
│       └── polling.js       # Real-time updates
├── docs/
│   ├── ARCHITECTURE.md     # This file
│   ├── API-SPEC.md        # API specification
│   ├── DATABASE-SCHEMA.md  # Database schema
│   └── AGENT-CLI.md       # CLI guide
├── Dockerfile
├── docker-compose.yml
├── openretro.db           # SQLite DB (created at runtime)
└── README.md
```

---

*Generated by Gabi - 2026-02-27*
*Part of TASK-OPENRETRO-001*
