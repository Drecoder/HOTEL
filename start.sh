#!/bin/bash

echo "📄 Loading environment variables from .env"
[ -f .env ] && export $(grep -v '^#' .env | xargs)

echo "🧹 Installing and updating npm dependencies..."
npm install
npm update

# echo "🧹 Installing and updating backend dependencies..."
# cd apps/frontend
# npm install
# npm update
# cd ../backend

# # echo "🧹 Installing and updating frontend dependencies..."
# # cd apps/backend
# # npm install
# # npm update
# # cd ../..

# echo "🛠 Building backend and frontend..."
# # nx build backend
# nx build frontend

echo "🚀 Starting Hotel Ops Stack locally..."

# Stop old containers
docker compose down -v

# Start all services
docker compose up -d

# Wait for core services
services=("postgres" "redis" "zookeeper" "kafka") #"backend")
for svc in "${services[@]}"; do
  echo "⏳ Waiting for $svc..."
  docker compose wait $svc || echo "⚠️ $svc failed to become healthy"
done

echo "🎉 All services are running!"
# echo "Frontend: http://localhost:3000"
# echo "Backend: http://localhost:8080"

docker compose logs -f kafka zookeeper postgres # backend  frontend
