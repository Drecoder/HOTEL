#!/bin/bash

# ======================================================
# hotel-ops-demo Start Script
# Author: [Your Name]
# Purpose: Builds, cleans up, and launches the entire multi-service stack 
#          Defaults to dev profile unless --prod flag is passed
# ======================================================

PROFILE="dev"
if [ "$1" == "--prod" ]; then
    PROFILE="prod"
fi

echo
echo "🚀 Starting Hotel Operations Microservices Stack (Profile: $PROFILE)..."
echo

# --- 1. Stop and remove old containers & volumes ---
echo "1️⃣  Stopping and removing existing containers and volumes..."
docker compose down -v
if [ $? -ne 0 ]; then
    echo "❌ Failed to stop existing containers. Exiting."
    exit 1
fi

# --- 2. Build and start the stack ---
echo "2️⃣  Building images and launching all containers..."
docker compose --profile $PROFILE up --build -d
if [ $? -ne 0 ]; then
    echo "❌ Docker Compose failed to start the services. Exiting."
    exit 1
fi

# --- 3. Wait for critical services to be healthy ---
echo "3️⃣  Waiting for PostgreSQL, Backend, Users, Gateway, and Frontend services..."

check_health() {
    local service=$1
    local max_attempts=30
    local delay=5
    local url=$2
    local attempts=0

    while [ $attempts -lt $max_attempts ]; do
        if [ -z "$url" ]; then
            # Docker healthcheck
            status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null)
            if [ "$status" == "healthy" ]; then
                echo "✅ $service is healthy."
                return 0
            fi
        else
            # HTTP healthcheck
            if curl -s -f "$url" > /dev/null; then
                echo "✅ $service is responding at $url."
                return 0
            fi
        fi
        echo "⏳ Waiting for $service... ($((attempts+1))/$max_attempts)"
        sleep $delay
        attempts=$((attempts+1))
    done

    echo "⚠️  $service did not become healthy/respond in time."
    return 1
}

# Core services (update names depending on dev/prod)
services=("hotel-ops-postgres" "hotel-ops-backend" "hotel-ops-users" "hotel-ops-gateway")
for svc in "${services[@]}"; do
    check_health $svc
done

# Frontend HTTP check
check_health "hotel-ops-frontend" "http://localhost:3000"

echo
echo "🎉 SUCCESS! All core services are healthy and running."
echo "------------------------------------------------------------------"
echo "APPLICATIONS ARE AVAILABLE ON YOUR HOST MACHINE:"
echo "Frontend (React/Vite):  http://localhost:3000"
echo "Backend (GraphQL API):  http://localhost:8080/graphql"
echo "Users Service GraphQL:  http://localhost:8082/graphql"
echo "Apollo Gateway:         http://localhost:4000/graphql"
echo "Kafka Broker:           localhost:9092"
echo "------------------------------------------------------------------"
echo

# --- 4. Tail logs for all core services ---
echo "4️⃣  Monitoring core service logs (Ctrl+C to stop)..."
docker compose --profile $PROFILE logs -f backend users gateway frontend postgres kafka zookeeper
