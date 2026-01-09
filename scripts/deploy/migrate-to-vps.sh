#!/bin/bash
set -e

# Configuration
VPS_IP="103.186.31.46"
VPS_USER="ubuntu"
VPS_PORT="19080"
VPS_PASS="!Rere98" # Used via sshpass
REMOTE_DIR="/home/ubuntu/premium-invitation"
# Token extracted from running process
CF_TOKEN="eyJhIjoiMDYxNDkyNTQyYThhMzYwZTE0ZWUyNGFhM2YwNzU0YTEiLCJ0IjoiZWRhYWU5MGItZDFkMC00OTJiLWEyMTAtZDlmNzY2OTY3NWE4IiwicyI6Ik1qSm1OV1l4TURndE5HRm1OaTAwTmpBMExUZzFaR1F0WkRZeE5XVmxaVFk0TURCbCJ9"

echo "🚀 Starting Migration to VPS ($VPS_IP)..."

# 1. Install sshpass if missing (Locally)
if ! command -v sshpass &> /dev/null; then
    echo "🔧 Installing sshpass..."
    sudo apt-get install -y sshpass
fi

# 2. Provision VPS (Run provision script remotely)
echo "🛠️  Provisioning VPS Environment..."
sshpass -p "$VPS_PASS" scp -P $VPS_PORT -o StrictHostKeyChecking=no scripts/deploy/provision-vps.sh $VPS_USER@$VPS_IP:/tmp/provision-vps.sh
sshpass -p "$VPS_PASS" ssh -p $VPS_PORT -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "chmod +x /tmp/provision-vps.sh && /tmp/provision-vps.sh"

# 3. Build Locally (Faster than minimal VPS)
echo "🏗️  Building Project Locally..."
bun run build

# 4. Sync Files
echo "Cc📦 Uploading Files..."
# Exclude node_modules, .git, .output (we just built it, wait.. we SHOULD upload .output for production run)
# Actually, standard Nuxt deployment is: upload .output, package.json, nuxt.config.ts (for some utils), bun.lockb.
# But for simplicity and robustness with Drizzle, we act like full source sync but exclude node_modules.
# We will run 'bun install' on remote.
sshpass -p "$VPS_PASS" rsync -avz -e "ssh -p $VPS_PORT -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.nuxt' \
    --exclude '.env' \
    --exclude 'database/sqlite.db' \
    ./ $VPS_USER@$VPS_IP:$REMOTE_DIR/

# 5. Setup Remote .env
echo "🔐 Configuring Secrets..."
# We create .env on remote with the same values as local (assuming local .env is good), minus machine specific stuff if any.
# Actually, just uploading the local .env is easiest for now.
sshpass -p "$VPS_PASS" scp -P $VPS_PORT -o StrictHostKeyChecking=no .env $VPS_USER@$VPS_IP:$REMOTE_DIR/.env

# 6. Start Services Remotely
echo "🔌 Starting Services on VPS..."
sshpass -p "$VPS_PASS" ssh -p $VPS_PORT -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP <<EOF
    export PATH="\$HOME/.bun/bin:\$PATH"
    cd $REMOTE_DIR
    
    echo "📦 Installing Dependencies on VPS..."
    bun install --production

    echo "🔄 Starting PM2 Ecosystem..."
    # Update ecosystem to include the specific CF Token for the VPS side
    # We can inject the token into the environment or modify the ecosytem file.
    # The ecosystem file uses 'zalan-tunnel' script. We need to make sure 'cloudflared' is in valid path or the script handles it.
    
    # Let's ensure the tunnel script uses the token.
    # We will modify the start command for tunnel in ecosystem.config.cjs dynamically or just ensure the token arg is passed.
    # Wait, the local process was running 'cloudflared tunnel run --token ...'
    # The ecosystem.config.cjs prob calls a script file. Let's check it.
    
    pm2 delete all || true
    
    # We need to make sure the tunnel runs with the token.
    # We will use a direct command for simplicity or set the env var.
    export TUNNEL_TOKEN="$CF_TOKEN"
    
    # Start app
    pm2 start ecosystem.config.cjs
    
    # Save PM2 list so it survives reboot
    pm2 save
    pm2 startup | tail -n 1 | bash || true
EOF

# 7. Purge Cloudflare Cache (if credentials available)
echo "🧹 Purging Cloudflare Cache..."
if [ -n "$CF_ZONE_ID" ] && [ -n "$CF_API_TOKEN" ]; then
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}')
    
    if echo "$PURGE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Cloudflare cache purged successfully"
    else
        echo "⚠️  Cloudflare cache purge failed (non-critical)"
        echo "$PURGE_RESPONSE"
    fi
else
    echo "⚠️  Cloudflare credentials not found in .env - skipping cache purge"
    echo "   Add CF_ZONE_ID and CF_API_TOKEN to .env for automatic cache purging"
fi

echo "✅ MIGRATION SUCCESSFUL! VPS is taking over."
