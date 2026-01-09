#!/bin/bash

echo "🚀 Starting Deployment..."

# 1. Install dependencies (if any new ones)
echo "📦 Installing dependencies..."
bun install

# 2. Build the application (DISABLED: Build handled by Cloudflare)
# echo "🛠️  Building application..."
# bun run build

# 3. Start/Restart all services (WhatsApp/Telegram Worker & Tunnel)
echo "🔄 Starting Services..."
npx pm2 start ecosystem.config.cjs
npx pm2 save

echo "✅ Deployment Success! App is running on Port 3001."
