# My Skills Hub

> Personal collection of Agent Skills, MCP servers, and AI tools — auto-synced from GitHub.

## How It Works

```
GitHub API ──▸ Collection ──▸ Cleaning ──▸ Scoring ──▸ Web UI
               (6 phases)    (classify)    (0-100)    (Search + Filter)
```

| Layer | Stack |
|-------|-------|
| Backend | Python 3.12 · FastAPI · SQLAlchemy · httpx |
| Frontend | React · TypeScript · Vite · Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) / SQLite (local) |
| Deploy | GitHub Pages + GitHub Actions (every 8h) |

### Adding Skills

There are **3 ways** to add skills to your collection:

1. **Automatic discovery** — The sync job searches GitHub every 8 hours using keyword queries (mcp-server, claude-skill, agent-tool, etc.)
2. **Submit + Approve** — Use the "Add a Skill" form on the homepage → Approve in Admin panel → Next sync picks it up
3. **Curated lists** — Edit `data/curated/*.txt` files (one `owner/repo` per line), push to main → Sync auto-imports them

### Flow: Submit → Approve → Sync → Visible

```
User submits repo URL
  → extra_repos (status=pending, is_active=false)
  → Admin approves (status=approved, is_active=true)
  → Next sync: Phase 3 fetches repo from GitHub
  → Phase 6: upsert into skills table
  → Frontend shows the new skill
```

## Quick Start (Local Development)

### 1. Backend

```bash
cd backend
python3.12 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set GITHUB_TOKEN and ADMIN_TOKEN
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# For local dev, VITE_API_BASE_URL=http://localhost:8000 is the default
npm run dev
```

### 3. Run a sync locally

```bash
cd backend
python sync_runner.py
```

### 4. Test the full flow

1. Open `http://localhost:5173`
2. Scroll to "Add a Skill" → Submit a GitHub repo URL
3. Open `http://localhost:5173/admin` → Enter your `ADMIN_TOKEN` as Bearer token
4. Go to "Submissions & Extra Repos" → Approve the submission
5. Run `python sync_runner.py` again
6. The skill now appears in the Skills list

## Production Deployment (GitHub + Supabase)

### Prerequisites

1. **Supabase project** — Create one at [supabase.com](https://supabase.com)
   - Run database migrations (see `backend/app/models/`)
   - Set up views & RPCs (see `docs/system-architecture.md`)
2. **GitHub repo** — Fork or push this repo to your GitHub

### GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `GH_TOKEN` | GitHub PAT with `public_repo` scope ([create here](https://github.com/settings/tokens)) |
| `SUPABASE_DB_URL` | Transaction pooler URL from Supabase Dashboard → Settings → Database |
| `VITE_SUPABASE_URL` | Supabase project URL (e.g., `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key from Dashboard → Settings → API |

### GitHub Actions

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `sync.yml` | Every 8h / push to `data/curated/` / manual | Loads curated repos → Syncs from GitHub → Writes to Supabase |
| `deploy.yml` | Push to main / after sync / manual | Builds frontend → Deploys to GitHub Pages |

### Admin Panel

The Admin panel is at `/admin`. It requires an `ADMIN_TOKEN`:

- **Local**: Set `ADMIN_TOKEN` in `backend/.env`
- **Production (Supabase mode)**: The frontend calls Supabase RPCs. Admin endpoints (`/api/admin/*`) need a running FastAPI backend, OR you can approve repos directly in the Supabase dashboard (`extra_repos` table: set `status='approved'`, `is_active=true`)

### Curated Lists

Edit files in `data/curated/` to maintain a permanent personal collection:

```
data/curated/
  mcp-server.txt    # MCP servers
  claude-skill.txt  # Claude skills
  agent-tool.txt    # Agent tools
```

Each file: one `owner/repo` per line, `#` for comments. Push to main triggers a sync.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/skills` | Paginated list (search, filter, sort) |
| GET | `/api/skills/{id}` | Skill detail + compatible skills |
| GET | `/api/trending` | Star velocity leaders (7 days) |
| GET | `/api/rising` | New this week |
| GET | `/api/top-rated` | Highest scored |
| GET | `/api/stats` | Summary statistics |
| GET | `/api/feed.xml` | RSS 2.0 feed |
| POST | `/api/submit-skill` | Submit a GitHub repo |
| PUT | `/api/admin/extra-repos/{id}/approve` | Approve a submission (Bearer token) |

## Docs

- [Scoring Algorithm](docs/scoring-algorithm.md) — Full scoring design
- [System Architecture](docs/system-architecture.md) — Detailed pipeline reference
