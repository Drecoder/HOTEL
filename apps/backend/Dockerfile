# -----------------------------
# 1️⃣ Builder Stage
# -----------------------------
FROM node:20-alpine3.22 AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json nx.json tsconfig.base.json ./

# Install all deps including dev (needed for Nx build)
RUN npm ci

# Copy backend source
COPY apps/backend ./apps/backend

# Build backend
RUN npm run build:backend

# -----------------------------
# 2️⃣ Production Stage
# -----------------------------
FROM node:20-alpine3.22

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

# Copy dist + package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production deps
RUN npm ci --omit=dev

EXPOSE 8080
CMD ["node", "dist/apps/backend/main.js"]
