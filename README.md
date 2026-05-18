# CareerFlow

Personal career and project management system — built for the System Analysis & Design course (Spring 2026).

## What it does

CareerFlow helps students and freelancers track their professional growth in one place:

- **Skills** — track skill levels, categories, and learning progress
- **Career Goals** — set goals with deadlines and priorities, track progress
- **Projects** — manage freelance or personal projects with client info and status
- **Skill-Fit Score** — calculates how well your skills match a project's requirements

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (SPA), HTML, CSS |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Testing | Jest |

## Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/careerflow.git
cd careerflow

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The app runs at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

Interactive Swagger UI is available at:
```
http://localhost:3000/api-docs
```

## Running Tests

```bash
npm test
```

Tests cover the business logic services (auth, skill, goal, skill-fit). Route testing is not required per project spec.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, get JWT token |

### Skills (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List all skills (supports `?search=`, `?status=`, `?category=`) |
| GET | `/api/skills/:id` | Get a skill |
| POST | `/api/skills` | Create a skill |
| PUT | `/api/skills/:id` | Update a skill |
| DELETE | `/api/skills/:id` | Delete a skill |

### Goals (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List goals (supports `?priority=`, `?completed=`) |
| GET | `/api/goals/:id` | Get a goal |
| POST | `/api/goals` | Create a goal |
| PUT | `/api/goals/:id` | Update a goal |
| DELETE | `/api/goals/:id` | Delete a goal |

### Projects (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects (supports `?status=`, `?search=`) |
| GET | `/api/projects/:id` | Get a project |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| GET | `/api/projects/:id/skill-fit` | Calculate skill-fit score |

## Project Architecture

```
careerflow/
├── src/
│   ├── app.js              # Express setup, Swagger config, middleware
│   ├── db/
│   │   └── database.js     # SQLite connection + schema init
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── routes/             # Route handlers (thin layer, no business logic)
│   │   ├── auth.js
│   │   ├── skills.js
│   │   ├── goals.js
│   │   └── projects.js
│   └── services/           # Business logic (unit tested)
│       ├── authService.js
│       ├── skillService.js
│       ├── goalService.js
│       ├── projectService.js
│       └── skillFitService.js
├── public/                 # SPA frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── skills.js
│       ├── goals.js
│       └── projects.js
└── tests/                  # Unit tests
    ├── authService.test.js
    ├── skillService.test.js
    ├── goalService.test.js
    └── skillFitService.test.js
```

## Skill-Fit Score Formula

For each required skill in a project:
- `match = min(userLevel / requiredLevel, 1.0) × 100`
- Missing skills score 0
- Final score = average of all skill match scores

Example:
- Project requires: HTML:90, CSS:80, JS:70
- User has: HTML:90, CSS:80, JS:70
- Score: (100 + 100 + 100) / 3 = **100%**
