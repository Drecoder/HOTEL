FROM node:20-alpine
WORKDIR /app

# Copy monorepo root package files
COPY package*.json nx.json tsconfig.base.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy gateway app code and shared libs
COPY apps/gateway ./apps/gateway
COPY libs ./libs

# Start gateway
CMD ["npm", "run", "start:dev", "--workspace", "gateway"]
