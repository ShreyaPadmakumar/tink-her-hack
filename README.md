# CodeBridge

Real-time collaborative code editor built for remote pair programming and team coding sessions.

## What it does

- **Live code editing** — everyone sees changes instantly via WebSocket sync
- **Multi-file workspaces** — create, rename, delete files within a session
- **Shared canvas** — whiteboard for diagrams and brainstorming (fabric.js)
- **Voice chat** — peer-to-peer voice via PeerJS
- **Text chat** — real-time messaging in the session
- **Code execution** — run Python, JS, C++, Java, C code via Piston API
- **Intent detection** — shows what each collaborator is doing (building, exploring, etc.)
- **Host controls** — kick, mute, transfer host, end session

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Voice | PeerJS |
| Code execution | Piston API |
| Canvas | Fabric.js |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Install & run

```bash
# frontend
npm install
npm run dev

# backend (separate terminal)
cd server
npm install
npm run dev
```

### Environment variables

Create `.env` in root:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Create `.env` in `server/`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/codebridge
JWT_SECRET=your-secret-key
```

## Docker setup

Make sure Docker and Docker Compose are installed, then:

```bash
# build and start everything (mongo + backend + frontend)
docker compose up --build

# or run in background
docker compose up --build -d

# check logs
docker compose logs -f

# stop everything
docker compose down

# stop and remove volumes (wipes database)
docker compose down -v
```

Once running, open `http://localhost:5173` (frontend) and the API is at `http://localhost:5000/api`.

## Project structure

```
src/
  pages/          # Login, Dashboard, History, CreateJoin
  components/     # CodeEditor, Canvas, Chat, VoiceCall, Layout
  services/       # socket.js, authService, intentDetector, etc.
  utils/          # download helpers

server/src/
  routes/         # auth, rooms
  socket/         # realtime event handlers
  models/         # User, Room, RoomState
  middleware/     # JWT auth
```

## Team

Built by Team CodeBridge for TinkerHub Hackathon 2025.