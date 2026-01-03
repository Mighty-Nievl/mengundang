# Deployment Guide to Cloudflare

Siap Mas! Semua codingan sudah beres & rapi di folder ini.
Karena saya tidak bisa login ke GitHub & Cloudflare Mas (butuh password/browser), Mas tinggal jalankan perintah "Sakti" di bawah ini.

## Step 1: Login & Buat Database Cloudflare (Wajib)
Jalankan di terminal:

```bash
# 1. Login Cloudflare
npx wrangler login

# 2. Buat Database Baru
npx wrangler d1 create premium-invitation-db
```
🔴 **STOP & COPY:** Setelah perintah di atas, copy text `database_id` yang muncul (contoh: `xxxxx-xxxx-xxxx...`).

## Step 2: Update ID Database
Buka file `wrangler.toml` di folder ini, lalu tempel ID tadi:
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "premium-invitation-db"
database_id = "PASTE_ID_DISINI" <--- Tempel disini
```
*Save file `wrangler.toml`.*

## Step 3: Isi Data Database & Push ke GitHub
Kembali ke terminal, jalankan:

```bash
# 1. Kirim data user lama ke Cloudflare
npx wrangler d1 execute premium-invitation-db --file=seed-d1.sql --remote

# 2. Commit perubahan ID Database tadi (PENTING)
git add wrangler.toml
git commit -m "Update D1 Database ID"

# 3. Buat Repo GitHub Baru (Wajib punya akun GitHub)
# Buka https://github.com/new -> Buat repo "premium-invitation"
# Lalu copy perintah "push an existing repository" dan jalankan di sini, contoh:
git remote add origin https://github.com/USERNAME/premium-invitation.git
git branch -M main
git push -u origin main
```

## Step 4: Sambungkan ke Cloudflare Pages
1. Buka Dashboard Cloudflare Pages.
2. Klik **Connect to Git** -> Pilih Repo `premium-invitation`.
3. Di pengaturan build:
   - Framework preset: `Nuxt.js`
   - Build command: `npm run build`
   - Output directory: `.output/public`
4. **Environment Variables (Wajib diisi di Dashboard Cloudflare):**
   - `NUXT_HUB_PROJECT_KEY`: (Isi random string)
   - `INTERNAL_API_SECRET`: (Isi password rahasia buat CasaOS, misal `rahasia123`)

## Step 5: Setting CasaOS (Terakhir)
Setelah Web Cloudflare LIVE (misal: `https://premium-invitation.pages.dev`), update script di CasaOS.

Buka file `casaos-worker.ts` di laptop ini dan ubah:
```typescript
const API_BASE_URL = 'https://premium-invitation.pages.dev' // Ganti URL Cloudflare Mas
const API_SECRET = 'rahasia123' // Samain sama yang di Cloudflare
```

Lalu jalankan worker di CasaOS:
```bash
bun run casaos-worker.ts
```

🚀 **SELESAI!**
