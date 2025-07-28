#!/bin/bash

# Production deployment script
# This script stops the current environment, cleans up Docker resources, 
# pulls the latest code, and rebuilds the production environment

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

echo "📦 Step 1/4: Stopping current Docker environment..."
docker-compose down --remove-orphans

echo "🧹 Step 2/4: Cleaning up Docker resources..."
docker system prune --all --volumes --force

echo "📥 Step 3/4: Pulling latest code from repository..."
git pull

echo "🏗️  Step 4/4: Building and starting production environment..."
docker-compose -f docker-compose.prod.yml up --build

echo "✅ Production deployment completed successfully!"