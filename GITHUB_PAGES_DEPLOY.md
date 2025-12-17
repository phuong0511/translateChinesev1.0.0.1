# 🚀 Deploy lên GitHub Pages

## Step 1: Cấu hình `vite.config.ts`

Cập nhật file `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/classical-chinese-novel/', // Thay bằng repo name của bạn
})
```

## Step 2: Cập nhật `package.json`

Thêm scripts cho deployment:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

## Step 3: Cài đặt gh-pages

```bash
npm install --save-dev gh-pages
```

## Step 4: Tạo GitHub Repository

1. Tạo repo mới trên GitHub: `classical-chinese-novel`
2. Clone về máy
3. Copy tất cả file vào folder repo

## Step 5: Build & Deploy

```bash
# Build production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Step 6: GitHub Pages Settings

1. Đi vào repo → **Settings**
2. Chọn tab **Pages**
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** / Root
5. Custom domain: (nếu có)

## Step 7: Setup Custom Domain (Optional)

### Nếu có domain riêng:

1. Mua domain từ GoDaddy, Namecheap, etc.
2. Cấu hình DNS:
   ```
   A record: 185.199.108.153
   A record: 185.199.109.153
   A record: 185.199.110.153
   A record: 185.199.111.153
   CNAME: yourusername.github.io
   ```
3. GitHub Pages → **Custom domain**: nhập domain
4. Enable **Enforce HTTPS**

### Nếu không có domain:

URL sẽ là: `https://yourusername.github.io/classical-chinese-novel/`

## Step 8: Environment Variables

**GitHub Pages không hỗ trợ backend**, vì vậy:

1. Tất cả Firebase keys phải được đặt ở client-side (.env.local)
2. Firebase Firestore security rules sẽ quản lý quyền truy cập
3. Không cần máy chủ Node.js

Tạo `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 9: Workflow tự động (Optional)

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Sau đó thêm secrets trong GitHub repo:
- Settings → Secrets and variables → Actions
- Thêm tất cả Firebase keys

## Architecture

```
Frontend (React + Vite)
   ↓
GitHub Pages (Static hosting)
   ↓
Firebase Backend (Firestore + Auth)
   ↓
Cloud Storage (cho images)
```

## Checklist

- ✅ Firebase project tạo xong
- ✅ Firestore database setup
- ✅ Security rules cấu hình
- ✅ `.env.local` có Firebase keys
- ✅ Vite config có `base` path
- ✅ GitHub repo tạo
- ✅ `npm run deploy` thành công
- ✅ GitHub Pages enabled
- ✅ URL accessible

**Ready to deploy!** 🎉
