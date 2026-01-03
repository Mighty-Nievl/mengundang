#!/bin/bash
set -e
PASS="!Rere98"

# 1. Update & Install Essentials
echo "📦 Updating System..."
echo "$PASS" | sudo -S apt-get update -y
echo "$PASS" | sudo -S apt-get install -y unzip curl git

# 2. Install Bun
if ! command -v bun &> /dev/null; then
    echo "🍞 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
else
    echo "✅ Bun already installed"
fi

# 3. Install Node.js
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | echo "$PASS" | sudo -S -E bash -
    echo "$PASS" | sudo -S apt-get install -y nodejs
else
    echo "✅ Node.js already installed"
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "🚀 Installing PM2..."
    echo "$PASS" | sudo -S npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# 5. Setup Project Directory
TARGET_DIR="/home/ubuntu/premium-invitation"
mkdir -p "$TARGET_DIR"

# 6. Install Cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "☁️ Installing Cloudflared..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    echo "$PASS" | sudo -S dpkg -i cloudflared.deb
    rm cloudflared.deb
else
    echo "✅ Cloudflared already installed"
fi

echo "🎉 VPS Provisioning Complete! Ready for code deployment."
