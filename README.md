# Orion Pulse Lite

Tiny, beginner-friendly heartbeat service that keeps one Supabase row active forever.

## Features
- Node.js + TypeScript
- Supabase heartbeat updates on the same row
- Configurable interval via `.env` (default 2 hours)
- Safe retry on transient failures
- CLI: `pulse start|stop|status|ping-now|logs`
- Web dashboard with status, counters, logs, and manual ping
- Railway-ready

## Database table
```sql
create table if not exists heartbeat (
  id bigint primary key,
  message text,
  updated_at timestamptz not null default now()
);
```

## Setup
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Fill in Supabase credentials.
3. Install deps:
   ```bash
   npm install
   ```
4. Run service:
   ```bash
   npm run dev
   ```
5. Open dashboard: `http://localhost:3000`

## CLI usage
Run CLI commands against the running service:
```bash
npm run cli -- status
npm run cli -- ping-now
npm run cli -- logs
npm run cli -- stop
npm run cli -- start
```

## Railway
- `railway.json` is included.
- Set env vars in Railway project settings.
- Deploy from repo.

## Reliability details
- Prevents duplicate loops.
- Retries failed DB writes with bounded backoff.
- Handles graceful shutdown on SIGINT/SIGTERM.
- Keeps memory footprint low with a capped in-memory log buffer.

## Extensibility
Architecture is modular for future Telegram alerts, analytics, multi-project monitoring, and distributed workers.
