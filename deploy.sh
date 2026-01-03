#!/bin/bash

echo "🚀 Starting Deployment..."

# 1. Install dependencies (if any new ones)
echo "📦 Installing dependencies..."
bun install

# 2. Build the application
echo "🛠️  Building application..."
bun run build

# 3. Start/Restart all services (Web, Scheduler, Tunnel)
echo "🔄 Starting Services..."
pm2 start ecosystem.config.cjs
pm2 save

echo "✅ Deployment Success! App is running on Port 3001."
