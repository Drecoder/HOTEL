#!/bin/bash

# ======================================================
# hotel-ops-demo Start Script
# Author: [Your Name]
# Purpose: Builds, cleans up, and launches the entire multi-service stack 
# ======================================================

echo " "
echo "Starting Hotel Operations Microservices Stack (PostgreSQL, Kafka, NestJS, React/Vite)..."
echo " "

# --- 1. Clean up old containers, networks, and volumes ---
# -v is added to remove volumes, ensuring a clean database start (important for dev).
echo "1. Stopping and removing existing containers and volumes..."
docker compose down -v 

# --- 2. Launch the entire stack (Builds multi-stage images first) ---
# --build: Ensures the optimized Dockerfiles are used to build the latest images.
# -d: Runs the containers in detached mode (background).
echo "2. Building optimized images and launching all containers..."
docker compose up --build -d

# --- 3. Display status ---
if [ $? -eq 0 ]; then
    echo " "
    echo "✅ SUCCESS! All services are attempting to start and connect."
    echo " "
    echo "------------------------------------------------------------------"
    echo "APPLICATIONS ARE AVAILABLE ON YOUR HOST MACHINE:"
    echo "------------------------------------------------------------------"
    echo "Frontend (React/Vite):  http://localhost:3000"
    echo "Backend (GraphQL API):  http://localhost:8080/graphql"
    echo "Kafka Broker:           localhost:9092 (Client Connection)"
    echo "------------------------------------------------------------------"
    echo " "
    
    echo "3. Monitoring core service logs (Ctrl+C to stop monitoring)..."
    # Follow the logs of the critical services
    docker compose logs -f backend postgres kafka zookeeper
else
    echo " "
    echo "❌ ERROR: Docker Compose failed to start the services."
    echo "Please check the output above for specific build or startup errors."
    echo " "
fi