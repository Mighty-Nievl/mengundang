# Deployment Guide to Cloudflare

✅ **Beres Mas!** Database Cloudflare sudah saya buatkan, saya setting, dan saya isi datanya.

Tinggal satu langkah terakhir: **Kirim kode ini ke GitHub Mas.**

## Step 1: Push ke GitHub
Buka terminal dan jalankan perintah ini (sesuaikan `USERNAME` dengan username GitHub Mas):

```bash
# 1. Buat Repo GitHub Baru di website github.com (beri nama: mengundang)
# 2. Sambungkan folder ini ke GitHub:
git remote add origin https://github.com/USERNAME/mengundang.git
git branch -M main
git push -u origin main
```

## Step 2: Sambungkan ke Cloudflare Pages
1. Buka Dashboard Cloudflare Pages (https://dash.cloudflare.com).
2. Klik **Connect to Git** -> Pilih Repo `mengundang`.
3. Di pengaturan build:
   - Framework preset: `Nuxt.js`
   - Build command: `npm run build`
   - Output directory: `.output/public`
4. **Environment Variables (Wajib diisi di Dashboard Cloudflare):**
   - `NUXT_HUB_PROJECT_KEY`: (Isi random string)
   - `INTERNAL_API_SECRET`: `rahasia123`
   - `WHATSAPP_PHONE_ID`: `1113130907380188`
   - `WHATSAPP_TOKEN`: (Copy dari file .env di laptop)
   - `WHATSAPP_TARGET_PHONE`: (Nomor HP Admin, format 62...)

## Step 3: Setting CasaOS (Terakhir)
Setelah Web Cloudflare LIVE (misal: `https://mengundang.pages.dev`), update script di CasaOS.

Buka file `casaos-worker.ts` di laptop ini dan ubah:
```typescript
const API_BASE_URL = 'https://mengundang.pages.dev' // Ganti URL Cloudflare Mas
const API_SECRET = 'rahasia123'
```

Lalu jalankan worker di CasaOS:
```bash
bun run casaos-worker.ts
```

🚀 **SELESAI!**

## Step 4: Sambungkan ke Cloudflare Pages
1. Buka Dashboard Cloudflare Pages.
2. Klik **Connect to Git** -> Pilih Repo `mengundang`.
3. Di pengaturan build:
   - Framework preset: `Nuxt.js`
   - Build command: `npm run build`
   - Output directory: `.output/public`
4. **Environment Variables (Wajib diisi di Dashboard Cloudflare):**
   - `NUXT_HUB_PROJECT_KEY`: (Isi random string)
   - `INTERNAL_API_SECRET`: (Isi password rahasia buat CasaOS, misal `rahasia123`)

## Step 5: Setting CasaOS (Terakhir)
Setelah Web Cloudflare LIVE (misal: `https://mengundang.pages.dev`), update script di CasaOS.

Buka file `casaos-worker.ts` di laptop ini dan ubah:
```typescript
const API_BASE_URL = 'https://mengundang.pages.dev' // Ganti URL Cloudflare Mas
const API_SECRET = 'rahasia123' // Samain sama yang di Cloudflare
```

Lalu jalankan worker di CasaOS:
```bash
bun run casaos-worker.ts
```

🚀 **SELESAI!**
