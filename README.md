# OpenRetro

A lightweight retrospective meeting tool for agile teams.

## Features

- Create and manage retrospective sessions
- Add cards with comments
- Real-time updates via polling
- Simple, clean UI

## Tech Stack

**Frontend:**
- Vanilla JavaScript
- HTML5/CSS3
- Drag-and-drop interface

**Backend:**
- Python FastAPI
- SQLite database
- RESTful API

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose -f docker-compose.openretro.yml up -d
```

Access the app at: `http://localhost:8080`

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
Open `frontend/index.html` in your browser

## API Endpoints

- `GET /health` - Health check
- `POST /api/sessions` - Create new session
- `GET /api/sessions/{session_id}` - Get session details
- `POST /api/sessions/{session_id}/cards` - Add card to session
- `POST /api/sessions/{session_id}/cards/{card_id}/comments` - Add comment to card

## Project Structure

```
openretro/
├── frontend/           # Static HTML/CSS/JS files
│   ├── css/
│   ├── js/
│   ├── index.html      # Main retro board
│   ├── name.html       # Session name input
│   └── help.html       # Help page
├── backend/            # FastAPI application
│   ├── routers/        # API routes
│   ├── models.py       # Data models
│   ├── schemas.py      # Pydantic schemas
│   ├── database.py     # SQLite connection
│   ├── cli.py          # CLI commands
│   ├── main.py         # FastAPI app
│   └── Dockerfile      # Backend container
├── docker-compose.openretro.yml
└── README.md
```

## Database

SQLite database (`openretro.db`) is created automatically on first run.

**Note:** The database file is excluded from version control via `.gitignore`.

## Development

### Running Backend in Development Mode

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running Frontend

Open `frontend/index.html` in your browser, or use a simple HTTP server:

```bash
cd frontend
python -m http.server 8080
```

## License

MIT

---

*Part of the OpenClaw ecosystem*
