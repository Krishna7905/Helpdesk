# -----------------------------
# Stage 1: Install dependencies
# -----------------------------
FROM oven/bun:1 AS install

WORKDIR /app

COPY package.json bun.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY core/package.json ./core/

RUN bun install

# -----------------------------
# Stage 2: Build
# -----------------------------
FROM oven/bun:1 AS build

WORKDIR /app

# Copy workspace dependencies
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/server/node_modules ./server/node_modules
COPY --from=install /app/client/node_modules ./client/node_modules
COPY --from=install /app/core/node_modules ./core/node_modules

COPY . .

RUN cd server && bunx prisma generate
RUN cd client && bunx vite build

# -----------------------------
# Stage 3: Production
# -----------------------------
FROM oven/bun:1 AS production

WORKDIR /app

# Copy workspace dependencies
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/server/node_modules ./server/node_modules
COPY --from=install /app/client/node_modules ./client/node_modules
COPY --from=install /app/core/node_modules ./core/node_modules

COPY package.json ./
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/core ./core

# Prisma Client
COPY --from=build /app/server/src/generated ./server/src/generated

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "cd server && bunx prisma migrate deploy && cd .. && bun run server/src/index.ts"]