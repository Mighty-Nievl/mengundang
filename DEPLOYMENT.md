# Deployment Guide - Premium Invitation

## 1. Persiapan DNS (Wajib)
Sebelum deploy, pastikan Anda sudah setting DNS di panel domain Anda (Niagahoster/Domainesia/dll):

*   **Type**: `A Record`
*   **Host/Name**: `undangan`
*   **Value/Target**: `IP_VPS_ANDA` (misal: 103.xxx.xxx.xxx)
*   **TTL**: Automatic/3600

*Tunggu 10-30 menit agar domain terhubung.*

## 2. Persiapan VPS
Pastikan VPS sudah terinstall:
-   **Node.js 18+** / **Bun**
-   **Nginx**
-   **PM2** (`bun install -g pm2`)
-   **Git**

## 2. Setup Awal (Pertama Kali)
```bash
# Clone Repository
git clone <repo_url> premium-invitation
cd premium-invitation

# Install Dependencies
bun install

# Build App
bun run build

# Start PM2
pm2 start ecosystem.config.cjs
pm2 save
```

## 3. Update Aplikasi (Cara Cepat)
Jika ada update fitur baru, cukup jalankan script ini di VPS:
```bash
./deploy.sh
```
Script ini akan otomatis: `git pull` -> `build` -> `restart pm2`.

## 4. Running with PM2
We use PM2 to keep the app running in the background on **Port 3001**.

```bash
# Start the app
pm2 start ecosystem.config.cjs

# Make it autostart on reboot
pm2 save
pm2 startup
```

## 4. Cloudflare Tunnel (Recommended)
We use Cloudflare Tunnel to expose the local port `3001` securely without opening ports.

**Service Name**: `zalan-tunnel`
**Command**:
```bash
cloudflared tunnel run zalan-tunnel
```
*Note: This usually runs as a systemd service automatically.*

## 5. Nginx Configuration (Alternative)
If you prefer not to use Cloudflare Tunnel and want to use a direct domain pointing (A Record), follow this.

File: `/etc/nginx/sites-available/invitation`

```nginx
server {
    listen 80;
    server_name undangan.zalan.web.id; # Subdomain dari zalan.web.id

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/invitation /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 5. Admin Panel (Mini CMS)
Access the CMS at:
`http://invitation.zalanstore.com/admin`
Default Password: `karyawanbiasa`
