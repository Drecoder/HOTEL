# 1️⃣ Build Stage
FROM node:20-alpine3.22 AS builder

WORKDIR /app

# Copy root files for Nx
COPY package.json package-lock.json tsconfig.base.json nx.json ./

# Copy frontend app
COPY apps/frontend ./apps/frontend
# COPY libs ./libs # if you have shared libs

# Install all dependencies (workspaces)
RUN npm install

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# 2️⃣ Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
