# Xbox2PC — Public Export & Publication Security Policy

## 1. Core Principle: Fail-Closed Publication

Xbox2PC enforces a **strict fail-closed security and intellectual property protection policy**.  
If any automated security check, schema validation, path inspection, or immutability rule encounters an anomaly, **all publication steps immediately halt and candidate files are purged**.

Under no circumstances may proprietary game data or sensitive reverse-engineering artifacts be published.

---

## 2. Prohibited Information (Never Exported)

The following categories of data must **never** be exported, published, or referenced in the public repository:

| Category | Specific Artifacts Prohibited |
|---|---|
| **Original Executables** | PE binaries, DLLs, `.exe`, `.bin`, `.sys` from original game installations. |
| **Debug & Symbol Stores** | PDB files, private function names, proprietary game ordinals, decompiled source code. |
| **Encrypted Game Archives** | RPF archives (RPF7/8/9), Xbox Virtual Disks (`.xvd`), partition tables. |
| **Extracted Game Assets** | Audio streams, streaming databases (`.ttpf`), models, navmeshes, scripts, UI packages (`.pri`). |
| **Shader Bytecode** | Raw DXBC bytecode, raw DXIL containers, raw ACO binaries, shader disassembly dumps. |
| **Local Paths & Environments** | Absolute filesystem paths (`C:\...`, `E:\...`, `/home/...`), usernames, working directories. |
| **Original Binary Hashes** | SHA-256 or MD5 digests of copyrighted game assets and private binaries. |
| **Private Database Data** | Full SQLite tables, raw scan records, intermediate internal tables. |
| **Credentials & Secrets** | API tokens, GitHub Personal Access Tokens, signing certificates, AWS keys, passwords. |

---

## 3. Approved Public Information

Only sanitized aggregates and publicly documented references subject to explicit review are permitted:

1. **Aggregate Counts**: Total discovered physical PE binaries, aggregate logical libraries, total exported/imported symbol counts.
2. **Shader Architecture Aggregates**: Unique AMD RDNA2 ISA instruction counts, distribution by instruction family (VOP2, VOP3, SOP1, SMEM, etc.), decoded occurrence totals.
3. **Subsystem Hierarchies**: Logical subsystem categorizations (Graphics, Audio, Kernel, GPU Runtime).
4. **Platform Reference APIs**: Publicly documented Microsoft GDK headers, standard Windows SDK function names, and open AMD RDNA2 ISA mnemonics.
5. **Coverage Metrics**: Anti-inflated independent coverage metrics with strict closed denominators or designated Unknown.
6. **Historical Snapshots**: Versioned, immutable aggregate summaries.

---

## 4. Automated Security Audit Checks

Before any public export can be published, the automated `SecurityAuditor` validates:

- **Forbidden File Extensions**: Regex scanning for prohibited file extensions (`.rpf`, `.xvd`, `.ttpf`, `.pdb`, `.pri`, `.chunk`, `.dat`, `.pak`, etc.).
- **Absolute Local Paths**: Detection of Windows drive letters (`[A-Za-z]:\`), POSIX paths (`/home/`, `/Users/`), or local workspace directory strings.
- **Private Digest Leaks**: Comparison against the database's `files` table to guarantee that zero private file SHA-256 digests appear in any public JSON.
- **Binary Magic Markers**: Bytecode inspection for PE signatures (`MZ`), ELF (`\x7fELF`), XVD (`msft-xvd`), RPF (`RPF9`), and DirectX shaders (`DXBC`, `DXIL`).
- **Shannon Entropy Analysis**: Rejection of suspicious high-entropy base64 or hex-encoded binary blobs (> 4.6 bits).
- **Secret & Token Regexes**: Automated pattern matching for private keys, AWS tokens, GitHub credentials, and authorization headers.
- **Strict Pydantic Schema Validation**: Every public JSON file is validated with `extra="forbid"`. Any unexpected key raises an immediate error.

---

## 5. Explicit Human Approval Gate

Automated pipelines cannot publish public datasets without explicit human sign-off.
The publisher CLI requires the `--approve` flag:

```bash
# Refused (fails closed with ApprovalRequiredError):
python -m xbox2pc.cli publish --version 0.1.0

# Authorized with explicit human review:
python -m xbox2pc.cli publish --version 0.1.0 --approve
```

---

## 6. Snapshot Immutability Guarantee

Public historical snapshots are immutable. Once published, a snapshot record (e.g., `pub_0.1.0_34aa5634.json`) is cryptographically sealed. Any attempt to modify or overwrite an existing historical snapshot triggers a `SnapshotImmutabilityError` and halts publication.
