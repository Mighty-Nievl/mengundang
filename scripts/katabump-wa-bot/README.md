# WhatsApp Bot untuk Katabump

Bot WhatsApp yang akan di-deploy ke server Katabump untuk mengirim undangan otomatis.

## Cara Deploy ke Katabump

### 1. Upload File via SFTP

Gunakan SFTP client (FileZilla, WinSCP, atau terminal):

```bash
# Konek ke Katabump
sftp -P 2022 a9fab218c07e133.c0d77c12@sftp.fr-node-54.katabump.com
# Password: cfbc4c70860a

# Upload folder ini
put -r /path/to/katabump-wa-bot /
```

### 2. Install Dependencies

Setelah upload, masuk ke server dan install:

```bash
cd katabump-wa-bot
npm install
```

### 3. Set Environment Variable

Edit file `index.js` dan ganti:
```javascript
const API_SECRET = 'YOUR_SECRET_HERE'; // Ganti dengan secret dari Cloudflare
```

Atau set environment variable:
```bash
export INTERNAL_API_SECRET="your-secret-from-cloudflare"
```

### 4. Jalankan Bot

```bash
npm start
```

### 5. Scan QR Code

Setelah bot jalan, akan muncul QR code di terminal. Scan dengan WhatsApp di HP untuk login.

## Cara Kerja

1. Bot polling ke `https://mengundang.site/api/internal/notifications/poll` setiap 10 detik
2. Kalau ada pesan pending, bot kirim via WhatsApp
3. Setelah terkirim, bot konfirmasi ke `/api/internal/notifications/confirm`

## Troubleshooting

- **QR tidak muncul**: Pastikan Puppeteer/Chrome terinstall
- **Auth failed**: Hapus folder `whatsapp-session` dan scan ulang
- **Connection error**: Cek API_SECRET sudah benar

## File Structure

```
katabump-wa-bot/
├── index.js          # Bot script
├── package.json      # Dependencies
├── README.md         # Dokumentasi ini
└── whatsapp-session/ # Session WA (auto-generated)
```
