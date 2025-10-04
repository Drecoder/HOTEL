# Use Node 20 Alpine
FROM node:20-alpine
WORKDIR /app

# Copy monorepo root package files
COPY package*.json nx.json tsconfig.base.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy backend app code and shared libs
COPY apps/backend ./apps/backend
COPY libs ./libs

# Start backend in dev mode
CMD ["npx", "nx", "serve", "backend"]
