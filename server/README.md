# DevMetrics - Server

Quick start for running the server locally.

1. Copy the example env and fill in values:

```bash
cd server
cp .env.example .env
# Edit .env and set your MongoDB URI, GitHub OAuth keys and SESSION_SECRET
```

2. Install dependencies:

```bash
npm install
```

3. Run in development (requires `nodemon`):

```bash
npm run dev
```

4. Available endpoints:

- `GET /api/health` — health check
- Auth routes under `/api/auth` (GitHub OAuth)
- Commits, teams, user, stats, sync under `/api/*`

If you don't want to configure GitHub OAuth yet, you can still start the server and hit `/api/health`.
