FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

COPY jest.config.js tsconfig.jest.json ./
COPY tests ./tests

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/jest.config.js ./jest.config.js
COPY --from=builder /app/tsconfig.jest.json ./tsconfig.jest.json
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/src ./src
COPY openapi ./openapi

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 6969
CMD ["node", "dist/main.js"]
