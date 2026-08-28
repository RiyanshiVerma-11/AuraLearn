# Multi-stage Dockerfile for AuraLearn (Full-Stack Express + Vite React app)

# ── Stage 1: Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and lock files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and server code
COPY src ./src
COPY server ./server
COPY server.ts ./
COPY public ./public

# Build frontend and server
RUN npm run build

# ── Stage 2: Production runner stage ──────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy package manifests and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server bundles from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./

# Expose server port 4000
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start full-stack Node.js server
CMD ["node", "dist/server.cjs"]
