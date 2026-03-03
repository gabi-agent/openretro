# 🗄️ OpenRetro - Database Schema

**Version:** 1.0
**Date:** 2026-02-27
**Database:** SQLite

---

## Overview

OpenRetro uses SQLite for data persistence. The database consists of 3 tables: `sessions`, `cards`, and `comments`.

---

## ER Diagram

```
┌─────────────────────┐
│     sessions       │
│─────────────────────│
│ PK id             │
│    session_id      │
│    name            │
│    created_at      │
└─────────┬───────────┘
          │ 1
          │
          │ N
┌─────────▼───────────┐
│      cards         │
│─────────────────────│
│ PK id             │
│    card_id        │
│ FK session_id     │◄────┐
│    author         │     │
│    column_type    │     │
│    text           │     │
│    position       │     │
│    merged_into    │─────┘
│    created_at      │
│    updated_at      │
└─────────┬───────────┘
          │ 1
          │
          │ N
┌─────────▼───────────┐
│    comments        │
│─────────────────────│
│ PK id             │
│    comment_id     │
│ FK card_id        │
│    author         │
│    text           │
│    created_at      │
└───────────────────┘
```

---

## Tables

### 1. sessions

Stores retrospective session information.

| Column | Type | Constraints | Description |
|--------|-------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal ID |
| session_id | VARCHAR(36) | UNIQUE NOT NULL | UUID (public ID) |
| name | VARCHAR(100) | NOT NULL | Session name |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_session_id ON sessions(session_id);
```

---

### 2. cards

Stores retrospective cards.

| Column | Type | Constraints | Description |
|--------|-------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal ID |
| card_id | VARCHAR(36) | UNIQUE NOT NULL | UUID (public ID) |
| session_id | VARCHAR(36) | NOT NULL FK | Session UUID |
| author | VARCHAR(100) | NOT NULL | User/Agent name |
| column_type | VARCHAR(20) | NOT NULL | Column: `good`, `better`, `actions` |
| text | TEXT | NOT NULL | Card content (max 500 chars) |
| position | INTEGER | DEFAULT 0 | For ordering cards |
| merged_into | VARCHAR(36) | FK NULL | Card ID this was merged into |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

```sql
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(36) UNIQUE NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    author VARCHAR(100) NOT NULL,
    column_type VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    merged_into VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (merged_into) REFERENCES cards(card_id)
);

CREATE INDEX idx_cards_session_id ON cards(session_id);
CREATE INDEX idx_cards_column_type ON cards(column_type);
CREATE INDEX idx_cards_position ON cards(position);
```

**Constraints:**
- `column_type` must be one of: `good`, `better`, `actions`
- `text` length: 1-500 characters
- `author` length: 1-100 characters
- `merged_into` references `cards.card_id` (self-referencing FK)

---

### 3. comments

Stores comments on cards.

| Column | Type | Constraints | Description |
|--------|-------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal ID |
| comment_id | VARCHAR(36) | UNIQUE NOT NULL | UUID (public ID) |
| card_id | VARCHAR(36) | NOT NULL FK | Card UUID |
| author | VARCHAR(100) | NOT NULL | User/Agent name |
| text | TEXT | NOT NULL | Comment content (max 300 chars) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id VARCHAR(36) UNIQUE NOT NULL,
    card_id VARCHAR(36) NOT NULL,
    author VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);

CREATE INDEX idx_comments_card_id ON comments(card_id);
```

**Constraints:**
- `text` length: 1-300 characters
- `author` length: 1-100 characters

---

## Relationships

### sessions (1) → (N) cards

One session can have many cards.

```sql
SELECT c.* 
FROM cards c
JOIN sessions s ON c.session_id = s.session_id
WHERE s.session_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY c.column_type, c.position;
```

### cards (1) → (N) comments

One card can have many comments.

```sql
SELECT com.*
FROM comments com
JOIN cards c ON com.card_id = c.card_id
WHERE c.card_id = '660e8400-e29b-41d4-a716-446655440000'
ORDER BY com.created_at;
```

### cards (1) → (1) cards (self-referencing)

One card can be merged into another card.

```sql
SELECT 
    c.card_id as merged_card,
    m.card_id as target_card,
    c.text as merged_text,
    m.text as target_text
FROM cards c
JOIN cards m ON c.merged_into = m.card_id;
```

---

## Query Examples

### Get All Cards for a Session

```sql
SELECT 
    card_id,
    author,
    column_type,
    text,
    position,
    created_at
FROM cards
WHERE session_id = ? AND merged_into IS NULL
ORDER BY column_type, position;
```

### Get Cards with Comments for a Session

```sql
SELECT 
    c.card_id,
    c.author,
    c.column_type,
    c.text,
    c.position,
    json_group_array(
        json_object(
            'comment_id', com.comment_id,
            'author', com.author,
            'text', com.text,
            'created_at', com.created_at
        )
    ) as comments
FROM cards c
LEFT JOIN comments com ON c.card_id = com.card_id
WHERE c.session_id = ? AND c.merged_into IS NULL
GROUP BY c.card_id
ORDER BY c.column_type, c.position;
```

### Merge Two Cards

```sql
-- Update source card to mark as merged
UPDATE cards
SET merged_into = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE card_id = ?;
```

### Delete Card and Comments

```sql
-- Delete comments first (due to FK)
DELETE FROM comments
WHERE card_id = ?;

-- Delete card
DELETE FROM cards
WHERE card_id = ?;
```

---

## Data Validation

### Application-Level Validation

| Field | Validation | Error Message |
|-------|-------------|----------------|
| sessions.name | 1-100 chars | "Session name must be 1-100 characters" |
| cards.author | 1-100 chars | "Author name must be 1-100 characters" |
| cards.column_type | good/better/actions | "Column type must be good, better, or actions" |
| cards.text | 1-500 chars | "Card text must be 1-500 characters" |
| comments.author | 1-100 chars | "Author name must be 1-100 characters" |
| comments.text | 1-300 chars | "Comment text must be 1-300 characters" |

### SQL Constraints

- UNIQUE constraints on UUIDs
- FOREIGN KEY constraints
- NOT NULL constraints
- DEFAULT timestamps

---

## Migration Strategy

### Initial Setup

```python
# backend/database.py

import sqlite3
from pathlib import Path

def init_db():
    """Initialize database with schema."""
    db_path = Path(__file__).parent / "openretro.db"
    conn = sqlite3.connect(db_path)
    
    with open(Path(__file__).parent / "schema.sql", "r") as f:
        schema = f.read()
        conn.executescript(schema)
    
    conn.commit()
    conn.close()
```

### Future Migrations

For production, use Alembic:

```bash
# Generate migration
alembic revision --autogenerate -m "Add new column"

# Apply migration
alembic upgrade head
```

---

## Performance Considerations

### Indexes

- `sessions(session_id)` - Fast session lookup
- `cards(session_id)` - Fast card filtering by session
- `cards(column_type)` - Fast column filtering
- `cards(position)` - Fast ordering
- `comments(card_id)` - Fast comment lookup

### Query Optimization

- Use prepared statements (parameterized queries)
- Filter by indexed columns first
- Use `json_group_array` for aggregating comments (SQLite JSON support)

---

## Backup Strategy

### Simple Backup

```bash
# Backup
cp openretro.db openretro.db.backup

# Restore
cp openretro.db.backup openretro.db
```

### Export to SQL

```bash
sqlite3 openretro.db .dump > openretro.sql
```

---

*Generated by Gabi - 2026-02-27*
*Part of TASK-OPENRETRO-001*
