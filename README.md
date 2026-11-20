# Xbox2PC — Public Discovery & Compatibility Dashboard

An open-source visualization dashboard and architectural research index for **Xbox Series X|S (Scarlett)** binary compatibility, featuring x86-64 AMD Zen 2 CPU services and AMD RDNA2 (GFX10.3) GPU shader instructions.

> [!IMPORTANT]
> **Research & Compatibility Disclaimer**: This dashboard visualizes empirical discovery, dependency mapping, and architectural analysis progress. It does **NOT** represent a claim of complete Xbox system compatibility, commercial emulation readiness, or game playability. No copyrighted game binaries, proprietary assets, decompiled source, or DRM-bypass mechanisms are published.

---

## 1. Dual-Environment Architecture

To protect proprietary intellectual property while providing open, transparent research metrics, Xbox2PC enforces strict physical and logical separation into two independent environments:

```
+-----------------------------------------------------------------------+
|                       PRIVATE ENVIRONMENT: Xbox2PC Core                |
|  - Original game files & PE binaries (DLLs, PDBs)                      |
|  - Encrypted RPF9 & XVD disk archives (unmodified)                     |
|  - Shader bytecode containers (DXBC, XPSF, ACO)                        |
|  - Complete internal SQLite database (xbox2pc.db)                      |
|  - Raw scanner, disassembly analyzers, and internal snapshot records   |
+-----------------------------------------------------------------------+
                                    |
                    [ Sanitization & Allowlist Exporter ]
                    [ Fail-Closed Security Audit Gate  ]
                    [ Explicit Human Review Approval   ]
                                    v
+-----------------------------------------------------------------------+
|                       PUBLIC ENVIRONMENT: Xbox2PC Public               |
|  - Standalone React 19 + TypeScript + D3.js dashboard source           |
|  - Sanitized aggregate JSON datasets (data/public/*.json)              |
|  - Publicly documented GDK API and AMD RDNA2 ISA catalogs              |
|  - Immutable versioned historical snapshots                            |
|  - GitHub Pages static deployment configuration                        |
+-----------------------------------------------------------------------+
```

### Private Environment: Xbox2PC Core
Retains all raw analysis artifacts, the full SQLite database, PE scanners, and intermediate telemetry. **Nothing from this environment is publicly accessible or committed to public branches.**

### Public Environment: Xbox2PC Public
Contains exclusively sanitized, high-level aggregate statistics, documented platform references, and the dashboard frontend. The public dashboard operates completely independently without requiring access to the private database or any private game files.

---

## 2. Core Dashboard Features

- **Executive KPI Cards**: Real-time aggregate counts for physical binaries, logical libraries, exported/imported symbols, decoded shader instructions, and cataloged files.
- **Library Subsystem Treemap**: Hierarchical D3.js treemap organizing discovered libraries by subsystem, sized by export symbol count.
- **AMD RDNA2 GPU Instruction Treemap**: Frequency distribution of 202 decoded RDNA2 shader instructions across 14 ISA families (VOP2, VOP3, VOP1, SOP1, SMEM, etc.).
- **Dependency Graph Explorer**: High-level relationship mapping between game middleware and required platform runtime targets (e.g., `d3d12_xs.dll`, `xmem.dll`, `XAudio2_9.dll`).
- **Immutable Historical Snapshots**: Comparison view of versioned discovery snapshots with delta metrics.
- **API & ISA Catalog**: Searchable public index of approved libraries, ISA mnemonics, and Microsoft GDK platform references.
- **Data Transparency Page**: Detailed technical explanations of what is measured, why denominators are conservative, and why global coverage is Unknown.

---

## 3. Strict Anti-Inflation Progress Policy

1. **Global Coverage is Unknown**: Because the total global Xbox operating system API surface has no closed denominator, global coverage is reported as **Unknown**. Fabricated denominators are strictly prohibited.
2. **Stubs Excluded**: Stub implementations, empty shims, or placeholder functions are permanently excluded from implementation metrics.
3. **Decoupled Completeness**: Discovery Completeness (99.97%) measures cataloged interfaces; Implementation Completeness (0.0%) measures validated execution code.

---

## 4. Local Development & Offline Preview

The dashboard has zero backend dependencies and works **100% offline**.

```bash
# Clone or navigate to the public dashboard directory
cd xbox2pc-public

# Install dependencies
npm install

# Start local development server
npm run dev

# Build static production bundle (for GitHub Pages or offline use)
npm run build

# Preview static production build
npm run preview
```

Production builds generate static files in `dist/`. The dashboard fetches its approved snapshot exclusively from `public/data/`; preview it through `npm run preview` (or Vercel), rather than opening `dist/index.html` directly, so those JSON requests are served correctly.

---

## 5. Publishing Pipeline

To update the public repository from the private analysis environment:

```bash
# 1. Export sanitized public datasets via strict allowlist
python -m xbox2pc.cli export-public

# 2. Run fail-closed security and integrity validation
python -m xbox2pc.cli validate-public

# Optional: audit the complete dashboard repository before a Git push
python -m xbox2pc.cli validate-public --dir xbox2pc-public --web-assets

# 3. View public snapshot publication diff
python -m xbox2pc.cli diff-public

# 4. Publish with explicit human approval gate (zero server required)
python -m xbox2pc.cli publish-public --approve
```

`--approve` is deliberately the only step that writes to this public repository. Review the diff and the candidate audit first; the build alone is not a publication authorization.

---

## 6. Implementation, Testing & Behavioral Validation Tracking

Xbox2PC features an audited implementation tracking system with strict anti-inflation guarantees:
- **Four-axis Lifecycle**: Discovery (`Unknown` → `Discovered` → `Analyzed` → `Specified`), Implementation (`Not implemented` → `Stub` → `Partial` → `Implemented`), Testing (`Not tested` → `Running` → `Failed` → `Passed`), and Validation (`Not validated` → `Partially validated` → `Behaviorally validated`).
- **Anti-Inflation Policy**: Detected stubs are strictly classified as `Stub` and excluded from progress. File presence alone does not count as implementation. Passing unit tests do not equal behavioral validation.
- **Git Drift Detection**: Monitors implementation references against repository commit SHAs and source files, flagging drifted components for review.

See [IMPLEMENTATION_TRACKING.md](IMPLEMENTATION_TRACKING.md) for detailed lifecycle specifications and code examples.

---

## 7. Cloud Deployment (Vercel & GitHub Pages)

The public dashboard is configured for zero-configuration deployment to **Vercel** and **GitHub Pages**:
- **Vercel Edge Network**: Includes `vercel.json` with SPA routing rewrites, immutable static asset caching, and security headers.
- **Zero Runtime Backend**: Consumes pre-computed JSON datasets in `public/data/`.
- **Preview & Production Environments**: Automates branch deployments on pull requests and production deployments on `main`.

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for full Vercel setup instructions.
See [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md) for security audit rules and [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Pages CI/CD configuration.
