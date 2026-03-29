# Multi-stage build: step 1 - compile TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --ignore-scripts

COPY tsconfig.discord-bot.json ./
COPY src/discord-bot ./src/discord-bot
RUN npx tsc -p tsconfig.discord-bot.json

# Multi-stage build: step 2 - runtime image
FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

COPY --from=builder /app/dist/discord-bot ./dist/discord-bot

CMD ["node", "dist/discord-bot/main.js"]
