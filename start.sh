#!/bin/bash

# ======================================================
# hotel-ops-demo Start Script
# Purpose: Builds, cleans up, and launches the multi-service stack including backend.
# ======================================================

# --- Load environment variables from .env (optional) ---
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "📄 Loaded environment variables from .env"
fi

echo
echo "🚀 Starting Hotel Operations Microservices Stack..."
echo

# --- 1. Stop and remove old containers & optionally volumes ---
echo "1️⃣  Stopping and removing existing containers..."
docker compose down -v  # remove -v if you want to preserve DB data

# --- 2. Build and start the stack ---
echo "2️⃣  Building images and launching containers..."
docker compose up --build -d \
  frontend \
  postgres \
  zookeeper \
  kafka \
#   backend

if [ $? -ne 0 ]; then
    echo "❌ Docker Compose failed to start the services. Exiting."
    exit 1
fi

# --- 3. Wait for containers to be running ---
echo "3️⃣  Waiting for core services to start..."

check_running() {
    local service=$1
    local max_attempts=20
    local delay=4
    local attempts=0

    while [ $attempts -lt $max_attempts ]; do
        status=$(docker compose ps -q $service | xargs docker inspect -f '{{.State.Running}}' 2>/dev/null)
        
        if [ "$status" == "true" ]; then
            echo "✅ $service is running."
            return 0
        fi
        
        echo "⏳ Waiting for $service to be running... ($((attempts+1))/$max_attempts)"
        sleep $delay
        attempts=$((attempts+1))
    done

    echo "⚠️  $service did not start in time. Check 'docker logs $service'."
    return 1
}

services=("frontend" "postgres" "zookeeper" "kafka") # "backend"
for svc in "${services[@]}"; do
    check_running $svc
done

echo
echo "🎉 SUCCESS! All services are running."
echo "------------------------------------------------------------------"
echo "APPLICATIONS ARE AVAILABLE ON YOUR HOST MACHINE:"
echo "Frontend (React/Vite):    http://localhost:3000"
# echo "Backend Service (GraphQL): http://localhost:8080"
echo "Postgres DB:              localhost:5433"
echo "Kafka Broker (internal):  kafka:9092"
echo "Kafka Broker (host):      localhost:9092"
echo "------------------------------------------------------------------"
echo

# --- 4. Tail logs for active services ---
echo "4️⃣  Monitoring service logs (Ctrl+C to stop)..."
docker compose logs -f frontend postgres zookeeper kafka #ackend
