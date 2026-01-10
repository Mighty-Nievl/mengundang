#!/bin/bash

echo "🚀 Starting Deployment..."

# 1. Install dependencies (if any new ones)
echo "📦 Installing dependencies..."
bun install

# 2. Build the application locally
echo "🛠️  Building application..."
npm run build

# 3. Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=mengundang

# 4. Start/Restart local services (WhatsApp/Telegram Worker)
echo "🔄 Starting Local Services..."
npx pm2 start ecosystem.config.cjs
npx pm2 save

echo "✅ Deployment Success!"
