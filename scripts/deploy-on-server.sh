#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "→ git pull"
git pull

echo "→ docker compose build app"
docker compose build app

echo "→ docker compose up -d postgres"
docker compose up -d postgres

echo "→ wait for postgres..."
sleep 5

echo "→ prisma migrate deploy"
docker compose run --rm app npx prisma migrate deploy

echo "→ docker compose up -d app"
docker compose up -d app

echo "Deploy done."
