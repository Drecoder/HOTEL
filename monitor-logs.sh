#!/bin/bash
# monitor-logs-color.sh

CONTAINERS=(
  "hotel-ops-backend"
  "hotel-ops-frontend"
  "hotel-ops-postgres"
  "hotel-ops-redis"
  "hotel-ops-zookeeper"
  "hotel-ops-kafka"
)

COLORS=(31 32 33 34 35 36) # Red, Green, Yellow, Blue, Magenta, Cyan

echo "🚀 Monitoring logs for hotel stack..."

for i in "${!CONTAINERS[@]}"; do
  container="${CONTAINERS[$i]}"
  color="${COLORS[$i]}"
  docker logs -f "$container" 2>&1 | sed "s/^/[\033[${color}m$container\033[0m] /" &
done

wait
