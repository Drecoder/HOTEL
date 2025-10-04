FROM node:20-alpine
WORKDIR /app

# Copy monorepo root package files
COPY package*.json nx.json tsconfig.base.json workspace.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy frontend app code
COPY apps/frontend ./apps/frontend

# Expose Vite port
EXPOSE 5173

# Start frontend dev server
CMD ["npm", "run", "dev", "--workspace", "frontend"]
