#!/bin/bash
set -e

# ----------------------------
# 🧹 Stop and remove all containers
# ----------------------------
echo
echo "🧹 Stopping and removing all containers..."
docker compose down --remove-orphans -v

# ----------------------------
# 🧹 Prune unused Docker images and builder cache
# ----------------------------
echo
echo "🧹 Pruning unused Docker images and builder cache..."
docker image prune -af
docker builder prune -af

# ----------------------------
# 🧹 Clean npm cache
# ----------------------------
echo
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# ----------------------------
# 🗑 Remove node_modules and package-lock.json in all package directories
# ----------------------------
echo
echo "🗑 Deleting all node_modules and package-lock.json across monorepo..."
find . -name "package.json" -not -path "./node_modules/*" | while read pkg; do
    dir=$(dirname "$pkg")
    rm -rf "$dir/node_modules" "$dir/package-lock.json"
done

# ----------------------------
# ✅ Done
# ----------------------------
echo
echo "✅ Super-clean complete: Docker, npm, and Node modules cleaned across the monorepo."
