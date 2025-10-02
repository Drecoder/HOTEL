# --------------------------------------------------------
# STAGE 1: Build the React/Vite Application
# --------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies (Vite setup requires this)
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the application
# Vite's default build command is 'npm run build', which outputs to a 'dist' folder.
# NOTE: Ensure your package.json has "build": "vite build"
RUN npm run build

# --------------------------------------------------------
# STAGE 2: Serve the Static Assets with Nginx
# --------------------------------------------------------
FROM nginx:alpine

# Copy the built assets from the builder stage.
# Vite's default output directory is 'dist'.
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Expose the port Nginx is listening on
EXPOSE 80

# The default Nginx CMD starts the web server
CMD ["nginx", "-g", "daemon off;"]