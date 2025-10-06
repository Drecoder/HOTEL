# -----------------------------
# 1️⃣ Build Stage
# -----------------------------
FROM node:20-alpine3.22 AS builder

ENV NODE_ENV=development
WORKDIR /app

# 1. Copy root and backend package files
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/backend/package*.json ./apps/backend/

# 2. Install all dependencies (including dev) for Nx build
RUN npm ci

# 3. Copy backend source
COPY apps/backend ./apps/backend

# 4. Build backend
RUN npm run build:backend

# -----------------------------
# 2️⃣ Production Stage
# -----------------------------
FROM node:20-alpine3.22

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

WORKDIR /app

# 1. Copy only what we need from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 2. Install only production dependencies
RUN npm ci --omit=dev

# 3. Expose and run
EXPOSE 8080
CMD ["node", "dist/apps/backend/main.js"]
