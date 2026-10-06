# syntax=docker/dockerfile:1
# Production images (docs/07-deployment.md), built by GitHub Actions — never on the home server.
#   docker build -f docker/Dockerfile --target web   -t portfolio-web .
#   docker build -f docker/Dockerfile --target stats -t portfolio-stats .

ARG BUN_VERSION=1.3.9
ARG NODE_VERSION=22
ARG CADDY_VERSION=2.11

FROM oven/bun:${BUN_VERSION} AS bun

# ---- build: Astro (Node) + Bun + Chromium for the PDFs --------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
ENV ASTRO_TELEMETRY_DISABLED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# Chromium and its system libraries, only for printing the PDFs during the build.
RUN bun x playwright install --with-deps --only-shell chromium

COPY . .
ARG SITE_URL=https://harry.mardika.my.id
ARG PUBLIC_STATS_ENABLED=true
ENV SITE_URL=${SITE_URL} PUBLIC_STATS_ENABLED=${PUBLIC_STATS_ENABLED}
# GITHUB_TOKEN is optional (raises the API rate limit) and never stored in an image layer.
RUN --mount=type=secret,id=github_token,required=false \
    GITHUB_TOKEN="$(cat /run/secrets/github_token 2>/dev/null || true)" bun run build
# Caddy serves these .br/.gz copies as-is, so the home server never compresses on request.
RUN bun scripts/precompress.ts
RUN bun build services/stats/server.ts --target=bun --minify --outfile /out/stats/server.js

# ---- web: Caddy serving the static site ----------------------------------------------------
FROM caddy:${CADDY_VERSION}-alpine AS web
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build-meta/csp.caddy /etc/caddy/csp.caddy
COPY --from=build /app/dist /srv
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

# ---- stats: the statistics service, bundled into one file ----------------------------------
FROM oven/bun:${BUN_VERSION}-slim AS stats
WORKDIR /app
COPY --from=build /out/stats/server.js ./server.js
ENV STATS_DB_PATH=/data/stats.sqlite STATS_PORT=8787 NODE_ENV=production
RUN mkdir -p /data && chown bun:bun /data
USER bun
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD bun -e "const r = await fetch('http://127.0.0.1:8787/api/stats/health'); process.exit(r.ok ? 0 : 1)"
CMD ["bun", "server.js"]
