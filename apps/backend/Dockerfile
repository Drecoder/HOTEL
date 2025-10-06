# -----------------------------
# 1. Base image
# -----------------------------
FROM node:20-alpine3.22

# -----------------------------
# 2. Environment variables
# -----------------------------
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

# -----------------------------
# 3. Setup workdir
# -----------------------------
WORKDIR /app

# -----------------------------
# 4. Install dependencies
# -----------------------------
# Copy root package files and backend package files
COPY package.json package-lock.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies (production only)
RUN npm ci --omit=dev

# -----------------------------
# 5. Copy full source
# -----------------------------
COPY . .

# -----------------------------
# 6. Build backend inside container
# -----------------------------
RUN npx nx build backend --prod

# -----------------------------
# 7. Entrypoint
# -----------------------------
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

# -----------------------------
# 8. Expose & run
# -----------------------------
EXPOSE 8080
CMD ["node", "dist/apps/backend/main.js"]
