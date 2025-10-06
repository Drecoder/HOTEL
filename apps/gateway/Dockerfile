# Stage 1: Builder
# Uses a full Node environment to install dependencies and run the Nx build.
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy necessary monorepo configuration files
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# 2. Install all dependencies.
RUN npm install

# 3. Copy the source code for ALL apps and libs for the monorepo build context.
COPY apps ./apps


# 4. Build the application
# FIX: Use the native 'nx run' command to ensure Nx correctly handles the workspace.
RUN npx nx run gateway:build

# Stage 2: Production Runner
# Uses a minimal Node image (node:20-alpine) to run the final application.
FROM node:20-alpine AS runner
WORKDIR /app

# Copy production dependencies (package.json needed for install)
COPY package.json ./
RUN npm install --production

# Copy the built output from the builder stage
COPY --from=builder /app/dist/apps/gateway/. ./dist/

# Set default environment variables
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=8080

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "dist/main.js"]
