# Production image (Next.js standalone). Build with:
#   docker build -t time-to-match --build-arg NEXT_PUBLIC_APP_URL=https://your.domain .
#
# Run (migrations as separate step — recommended):
#   docker run --rm -e DATABASE_URL=... time-to-match node scripts/db-migrate.mjs
#   docker run -p 3000:3000 -e DATABASE_URL=... -e AUTH_SECRET=... -e CRON_SECRET=... time-to-match
#
# Or migrate on start (init-container pattern in one image):
#   docker run -p 3000:3000 -e RUN_MIGRATIONS=1 -e DATABASE_URL=... ... time-to-match

FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Migration runner (optional RUN_MIGRATIONS=1 on start)
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/scripts/db-migrate.mjs ./scripts/db-migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.mjs ./scripts/docker-entrypoint.mjs
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres
USER nextjs
EXPOSE 3000
CMD ["node", "scripts/docker-entrypoint.mjs"]
