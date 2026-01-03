---
description: Deploy the application to production on port 3001
---
// turbo-all

1. Ensure the deployment script is up to date and correctly configured for PM2 process `zalan-web`.
2. Run the deployment script.
```bash
bash deploy.sh
```
3. Verify that the application is running and listening on port 3001.
```bash
pm2 logs zalan-web --lines 20 --nostream
```
