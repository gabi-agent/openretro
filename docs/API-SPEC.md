# 📡 OpenRetro - API Specification

**Version:** 1.0
**Date:** 2026-02-27
**Base URL:** `http://localhost:9982`

---

## Overview

OpenRetro provides a REST API for managing retrospective sessions, cards, and comments. The API is designed for both web frontend and CLI tool integration.

---

## Authentication

**No authentication required** (by design for simplicity).

All requests are public, identified only by UUIDs.

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Endpoints

### Sessions

#### Create Session

Create a new retrospective session.

```http
POST /api/sessions
Content-Type: application/json

{
  "name": "Sprint 1 Retrospective"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Session name (max 100 chars) |

**Response:** `201 Created`
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sprint 1 Retrospective",
  "created_at": "2026-02-27T01:00:00.000Z"
}
```

---

#### Get Session

Retrieve a session with all its cards and comments.

```http
GET /api/sessions/{session_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | Session ID |

**Response:** `200 OK`
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sprint 1 Retrospective",
  "created_at": "2026-02-27T01:00:00.000Z",
  "cards": [
    {
      "card_id": "660e8400-e29b-41d4-a716-446655440000",
      "author": "Alice",
      "column_type": "good",
      "text": "Team collaboration was great",
      "position": 0,
      "comments": [
        {
          "comment_id": "770e8400-e29b-41d4-a716-446655440000",
          "author": "Bob",
          "text": "I agree with this!",
          "created_at": "2026-02-27T01:10:00.000Z"
        }
      ],
      "created_at": "2026-02-27T01:00:00.000Z",
      "updated_at": "2026-02-27T01:00:00.000Z"
    }
  ]
}
```

---

### Cards

#### Create Card

Create a new card in a session.

```http
POST /api/sessions/{session_id}/cards
Content-Type: application/json

{
  "author": "Alice",
  "column_type": "good",
  "text": "Team collaboration was great"
}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | Session ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| author | string | Yes | User/Agent name (max 100 chars) |
| column_type | string | Yes | Column type: `good`, `better`, or `actions` |
| text | string | Yes | Card content (max 500 chars) |

**Response:** `201 Created`
```json
{
  "card_id": "660e8400-e29b-41d4-a716-446655440000",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "author": "Alice",
  "column_type": "good",
  "text": "Team collaboration was great",
  "position": 0,
  "created_at": "2026-02-27T01:00:00.000Z",
  "updated_at": "2026-02-27T01:00:00.000Z"
}
```

---

#### Update Card

Update a card's text or position.

```http
PUT /api/cards/{card_id}
Content-Type: application/json

{
  "text": "Updated text",
  "position": 1
}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| card_id | UUID | Card ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | No | New card content (max 500 chars) |
| position | integer | No | New position (for ordering) |

**Response:** `200 OK`
```json
{
  "card_id": "660e8400-e29b-41d4-a716-446655440000",
  "text": "Updated text",
  "position": 1,
  "updated_at": "2026-02-27T01:05:00.000Z"
}
```

---

#### Delete Card

Delete a card and all its comments.

```http
DELETE /api/cards/{card_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| card_id | UUID | Card ID |

**Response:** `204 No Content`

---

#### Merge Cards

Merge two cards together.

```http
POST /api/cards/{card_id}/merge
Content-Type: application/json

{
  "into_card_id": "770e8400-e29b-41d4-a716-446655440000"
}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| card_id | UUID | Card to merge (source) |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| into_card_id | UUID | Yes | Target card ID to merge into |

**Response:** `200 OK`
```json
{
  "merged_card_id": "660e8400-e29b-41d4-a716-446655440000",
  "into_card_id": "770e8400-e29b-41d4-a716-446655440000",
  "merged_text": "Original text + Merged text",
  "merged_at": "2026-02-27T01:15:00.000Z"
}
```

---

### Comments

#### Add Comment

Add a comment to a card.

```http
POST /api/cards/{card_id}/comments
Content-Type: application/json

{
  "author": "Bob",
  "text": "I agree with this!"
}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| card_id | UUID | Card ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| author | string | Yes | User/Agent name (max 100 chars) |
| text | string | Yes | Comment content (max 300 chars) |

**Response:** `201 Created`
```json
{
  "comment_id": "770e8400-e29b-41d4-a716-446655440000",
  "card_id": "660e8400-e29b-41d4-a716-446655440000",
  "author": "Bob",
  "text": "I agree with this!",
  "created_at": "2026-02-27T01:10:00.000Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "detail": "Additional details"
}
```

### Example Errors

#### 400 Bad Request
```json
{
  "error": "Invalid input",
  "detail": "column_type must be one of: good, better, actions"
}
```

#### 404 Not Found
```json
{
  "error": "Session not found",
  "detail": "Session with ID 550e8400-e29b-41d4-a716-446655440000 does not exist"
}
```

---

## Rate Limiting

**No rate limiting** (for demo purposes).

---

## CORS

**CORS enabled** for all origins (for demo).

In production, configure specific origins.

---

## API Documentation

**Swagger UI** (auto-generated by FastAPI):
`http://localhost:9982/docs`

**ReDoc:**
`http://localhost:9982/redoc`

---

*Generated by Gabi - 2026-02-27*
*Part of TASK-OPENRETRO-001*
