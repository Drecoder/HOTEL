# Stage 1: Builder (Builds the static assets)
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root-level config and install dependencies
COPY package.json package-lock.json nx.json tsconfig.base.json ./
RUN npm install

# Copy the full source code (Nx needs access to project graph)
COPY . .

# Build the frontend app using Nx
RUN npx nx build frontend

# Stage 2: Production Runner (Serves the static assets)
FROM node:20-alpine AS runner
WORKDIR /app

# Install the 'serve' utility globally to host the static files
RUN npm install -g serve

# Copy only the built static assets
COPY --from=builder /app/dist/apps/frontend/. ./dist/

# Frontend runs on 3000
EXPOSE 3000

# Command to serve the static files from the 'dist' directory
CMD ["serve", "-s", "dist", "-l", "3000"]
