.PHONY: up down build migrate lint logs shell

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

migrate:
	docker compose run --rm app npx prisma migrate deploy

migrate-dev:
	docker compose run --rm app npx prisma migrate dev

lint:
	docker compose run --rm app npm run lint

logs:
	docker compose logs -f

shell:
	docker compose run --rm app sh
