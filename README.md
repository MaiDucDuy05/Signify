# Signify — Video Conferencing Application

A real-time video conferencing app built with React, Node.js, WebSocket, and WebRTC.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Ant Design, React Router, SCSS Modules |
| **Backend** | Node.js, Express, Sequelize ORM |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Real-time** | WebSocket (`ws`), WebRTC |
| **Auth** | JWT with Redis token blacklisting |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (use `docker-compose up -d` in `/backend` for Redis)

### Backend Setup
```bash
cd backend
npm install
# Configure .env (DB credentials, JWT_SECRET, Redis, PORT)
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:4000`.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Redis configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── database/        # Sequelize init & associations
│   │   ├── middlewares/      # Error middleware
│   │   ├── models/          # User, Meeting, MeetingUser, Message
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & Redis caching
│   │   ├── websocket/       # WebSocket handlers
│   │   ├── app.js           # Express app config
│   │   └── server.js        # Server entry point
│   └── middlewares/         # Auth middleware (JWT + blacklist)
│
├── frontend/
│   ├── src/
│   │   ├── context/         # AuthContext (login/logout state)
│   │   ├── layouts/         # Header, Sidebar
│   │   ├── pages/           # Dashboard, Meeting, Schedule, etc.
│   │   ├── routes/          # React Router config
│   │   └── utils/           # API client, auth token helpers
│   └── public/
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout (blacklist token) |
| GET | `/api/meetings` | Yes | List all meetings |
| POST | `/api/meetings` | Yes | Create meeting |
| GET | `/api/meetings/:id` | Yes | Get meeting by ID |
| PUT | `/api/meetings/:id` | Yes | Update meeting |
| DELETE | `/api/meetings/:id` | Yes | Delete meeting |
| GET | `/api/meetings/code/:code` | Yes | Get by meeting code |
| GET | `/api/meetings/user/:userId` | Yes | Get user's meetings |
| GET | `/api/messages/meeting/:id` | Yes | Get meeting messages |
| POST | `/api/messages` | Yes | Send message |
