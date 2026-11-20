# Xbox2PC — Vercel Deployment Guide

## Overview

The **Xbox2PC Public Dashboard** is an open-source, read-only visualization web application built with **React 19**, **TypeScript**, and **Vite**. It provides researchers and developers with deep insights into Xbox Series X|S (Scarlett) executable discovery, library dependency topologies, AMD RDNA2 shader instruction sets, and implementation progress.

The dashboard runs **100% statically** on the Vercel Edge Network:
- **Zero runtime backend**: Does not connect to or require the private SQLite database.
- **Zero private assets**: Contains only sanitized aggregate metrics, ISA catalogs, and approved public snapshot diffs.
- **Client-side routing**: Fully configured single-page application (SPA).

---

## Architecture & Separation

```
[ Private Machine (Xbox2PC Core) ]
   ├── Original PE Binaries & PDBs
   ├── Private SQLite DB (xbox2pc_discovery.db)
   ├── Analysis Scanners & Git History
   │
   └── [ CLI: publish-public --approve ]
          │ (Exports sanitized JSON via strict Allowlist)
          ▼
[ Public Repository (xbox2pc-public) ]
   ├── src/ (React 19 + TypeScript components)
   ├── public/data/ (Sanitized JSON datasets)
   ├── vercel.json (SPA rewrites, cache rules, security headers)
   └── package.json (Vite build config)
          │
          └── [ Git Push to GitHub main ]
                 │
                 ▼
[ Vercel Edge Network ]
   ├── Global CDN Caching
   ├── Automatic Preview Branches (PRs)
   └── Production URL (https://xbox2pc.vercel.app)
```

---

## Vercel Project Configuration

When importing `xbox2pc-public` into the Vercel Dashboard, Vercel automatically detects Vite:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Detected automatically from `vite.config.ts` |
| **Root Directory** | `./` (or `xbox2pc-public` if monorepo) | Root of the public dashboard |
| **Build Command** | `npm run build` | Runs `tsc && vite build` |
| **Output Directory** | `dist` | Generated static web bundle |
| **Install Command** | `npm install` | Installs dependencies |
| **Node.js Version** | `20.x` or `22.x` (LTS) | Supported runtime environment |

---

## `vercel.json` Configuration

The repository includes a production-ready `vercel.json` with client-side SPA routing rewrites, cache policies, and HTTP security headers:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Routing & Headers Rationale
1. **SPA Rewrites**: Redirects all inbound routes to `/index.html` so client-side navigation functions seamlessly on page refresh.
2. **Immutable Assets**: Bundled JavaScript and CSS in `/assets/` are fingerprinted by Vite with content hashes, allowing 1-year immutable caching.
3. **Data Caching**: JSON datasets in `/data/` are cached for 1 hour with `stale-while-revalidate=86400`, ensuring visitors receive instant page loads while background edge workers fetch fresh snapshots.
4. **Security Hardening**: Standard headers prevent MIME sniffing, clickjacking (`DENY`), and cross-site scripting attacks.

---

## Git Workflow & Automatic Deployments

### 1. Environments
- **Production (`main` branch)**: Every push or approved merge to `main` automatically deploys to the production URL.
- **Preview (Pull Requests & feature branches)**: Every branch or PR generates an ephemeral, isolated preview deployment with a unique URL (e.g., `https://xbox2pc-git-feat-xyz.vercel.app`).

### 2. Deployment Steps
1. Push changes to GitHub:
   ```bash
   cd xbox2pc-public
   git add .
   git commit -m "feat: publish snapshot pub_0.2.0"
   git push origin main
   ```
2. Vercel webhook triggers:
   - Clones repo
   - Executes `npm install`
   - Executes `npm run build`
   - Validates `dist/` directory
   - Deploys static bundle to edge nodes

---

## Local Publishing & Synchronization Pipeline

To publish new discoveries from your local private environment to Vercel:

```bash
# 1. Run local discovery analysis (private environment)
python -m xbox2pc.cli scan

# 2. Export and validate sanitized datasets
python -m xbox2pc.cli export-public
python -m xbox2pc.cli validate-public

# 3. Inspect public snapshot diff
python -m xbox2pc.cli diff-public

# 4. Authorize publication and sync to public repo
python -m xbox2pc.cli publish-public --approve

# 5. Push public repo to trigger Vercel deployment
cd xbox2pc-public
git add .
git commit -m "chore(data): publish approved snapshot"
git push origin main
```

---

## Security Verification & Leak Prevention

Before any commit or deployment, the `validate-public` tool performs strict automated verification:
1. **Forbidden file extensions**: Rejects any `.exe`, `.dll`, `.pdb`, `.rpf`, `.xvd`, `.bin`, `.cso`, `.o`, `.obj`.
2. **Filesystem path leak check**: Verifies no absolute local file paths (e.g. `C:\`, `E:\`, `/home/`) are present in JSON datasets.
3. **Private hash check**: Scans all values against private database file hashes (SHA-256) to ensure raw binary hashes never leak.
4. **Strict Allowlist**: Only approved JSON data models defined in `PublicDataPackage` are permitted.
