FROM node:20-alpine
WORKDIR /app

# Copy monorepo root package files
COPY package*.json nx.json tsconfig.base.json workspace.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy users app code and shared libs
COPY apps/users ./apps/users
COPY libs ./libs

# Start users service
CMD ["npm", "run", "start:dev", "--workspace", "users"]
