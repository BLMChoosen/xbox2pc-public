# Xbox2PC — GitHub Pages Deployment Guide

The Xbox2PC public dashboard is designed as a **zero-backend, static production web application**. It can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or run completely offline on a local filesystem.

---

## 1. Zero-Backend Architecture

- **No Server Infrastructure**: The dashboard does not require a running database server, Node.js backend, or Python runtime.
- **Offline Self-Contained**: All public metrics are pre-compiled into static JSON assets in `public/data/` and embedded at build time into `dist/`.
- **No Secrets or Credentials**: Frontend build bundles contain zero private environment variables, database connection strings, or filesystem paths.

---

## 2. GitHub Pages Configuration

### Base Path (`base: './'`)
In `vite.config.ts`, the base path is set to relative (`./`):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
});
```

This guarantees that HTML, JS, CSS, and asset links resolve correctly whether the site is served from a user root (`https://user.github.io/`), a repository subpath (`https://user.github.io/xbox2pc/`), or opened directly in a browser via `file://`.

---

## 3. GitHub Actions Automated Deployment Workflow

The workflow at `.github/workflows/deploy.yml` automates deployment upon pushing to the `main` branch:

```yaml
name: Deploy Public Dashboard to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Public Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Static Production Dashboard
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload GitHub Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 4. Enabling GitHub Pages on Repository

1. Go to your GitHub repository: **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Push changes to `main` branch or trigger the workflow manually under **Actions > Deploy Public Dashboard to GitHub Pages**.
4. The site will be published at `https://<org>.github.io/<repo>/`.

---

## 5. Offline Verification

To test that the build works offline:

```bash
# Build production bundle
npm run build

# Preview via local server
npm run preview
```

Alternatively, open `dist/index.html` in Chrome/Firefox/Edge. The entire dashboard is fully interactive with zero network calls.
