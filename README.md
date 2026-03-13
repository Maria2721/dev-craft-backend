# dev-craft-backend

## Run

1. Copy `.env.example` to `.env` and set the variables
2. Start services: `docker compose up -d --build`
3. App listens on `PORT` from `.env` (default 6969)

## Health check

```bash
curl http://localhost:6969/health
```

Expected: `{"ok":true}`

## Tests

### Locally

```bash
npm test          # run unit tests
npm run test:cov  # run tests with coverage
```

### In Docker

```bash
docker compose run --rm app npm test
# or with coverage
docker compose run --rm app npm run test:cov
```
