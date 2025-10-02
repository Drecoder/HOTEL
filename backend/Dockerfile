# --- STAGE 1: BUILDER STAGE ---
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# --- STAGE 2: PRODUCTION STAGE ---
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Expose application ports
EXPOSE 8080
EXPOSE 8081

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --omit=dev

# Optional: Copy .env file if needed at runtime
# COPY --from=builder /app/.env ./

# Optional: Add healthcheck for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
