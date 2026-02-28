# dev-craft-backend

## Run

1. Copy `.env.example` to `.env` and set the variables
2. Start services: `docker compose up -d --build`
3. App listens on `PORT` from `.env` (default 6969)

## Test

```bash
curl http://localhost:6969/api/health
```

Expected: `{"ok":true}`