# 🏛️ MENGUNDANG COMMAND CENTER
  **High-Performance SaaS for Premium Digital Invitations**

...

## 💎 Project Philosophy
**Mengundang** is a high-fidelity digital ecosystem designed for sacred life events.

...

### Cloudflare Pages (Production)

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mengundang.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - Click **Connect to Git** → Select `mengundang`
   - Build settings:
     - Framework: `Nuxt.js`
     - Build command: `bun run build`
     - Output directory: `dist`

3. **Environment Variables** (Required in Cloudflare Dashboard):

...

4. **D1 Database Binding**
   - Database Name: `mengundang-db` (formerly `premium-invitation-db`)
   - Database ID: `bb43abd1-bf7c-4119-a685-7150b358f2eb`

### CasaOS Worker (Local)

After Cloudflare is live, configure the local worker:

```typescript
// casaos-worker.ts
const API_BASE_URL = 'https://mengundang.pages.dev'
const API_SECRET = 'your-internal-api-secret'
```

...

### 🚨 Wrangler CLI (Cloudflare)
| Command | Description |
|---------|-------------|
| `npx wrangler d1 execute mengundang-db --file=seed.sql` | Seed database |

...

<details>
<summary><strong>❌ D1 database not syncing</strong></summary>

**Cause**: Migration pending or binding misconfigured.

**Solution**:
```bash
npx wrangler d1 migrations apply mengundang-db
```
Verify `wrangler.toml` has correct `database_id`.
</details>

<details>
<summary><strong>❌ CasaOS worker cannot reach Cloudflare</strong></summary>

**Cause**: Network issue or incorrect API_BASE_URL.

**Solution**: Ensure `API_BASE_URL` points to your Cloudflare Pages URL (e.g., `https://mengundang.pages.dev`).
</details>

...

<p align="center">
  <b>Built for permanence. Engineered with integrity.</b><br>
  <sub>Copyright &copy; 2025-2026 Mengundang SaaS • NieVl</sub>
</p>
