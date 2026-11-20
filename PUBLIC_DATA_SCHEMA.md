# Xbox2PC — Public Data Schema Documentation

**Schema Version:** 1.0  
**Project:** Xbox2PC Discovery & Visualization  
**Target Architecture:** Scarlett (Xbox Series X|S) — AMD RDNA2 (GFX10.3) / x86-64  
**Validation Policy:** Fail-Closed Strict Pydantic Models (`extra="forbid"`)  
**Security Baseline:** Zero Raw File Contents, Zero Proprietary Game Assets, Zero Hashes, Zero Local Machine Paths

---

## 1. Overview of Public Datasets

The Xbox2PC public data pipeline exports 9 distinct, sanitized JSON datasets. These datasets represent aggregate statistics, public API references, and verified metrics derived from the private analysis environment:

1. [`overview.json`](#overviewjson) — High-level project status, aggregate discovery counts, and progress metrics.
2. [`coverage.json`](#coveragejson) — Comprehensive metrics breakdown with explicit numerators, denominators, and reference universes.
3. [`library_stats.json`](#library_statsjson) — Aggregate library-level inventory, symbol counts, and subsystem classifications.
4. [`shader_stats.json`](#shader_statsjson) — AMD RDNA2 ISA instruction occurrences, format distributions, and family breakdowns.
5. [`dependency_stats.json`](#dependency_statsjson) — Library import/export relationship topologies and external target references.
6. [`catalog.json`](#catalogjson) — Documented public platform API references (GDK, DirectX 12, AMD FidelityFX).
7. [`implementation_stats.json`](#implementation_statsjson) — Component implementation lifecycle records, review flags, and test associations.
8. [`audit_status.json`](#audit_statusjson) — Independent audit verdict, active discrepancies, and verification evidence.
9. [`snapshots/index.json`](#snapshotsindexjson) — Immutable historical audit snapshot manifest.

---

## 2. Dataset Schemas & Safety Justifications

### `overview.json`

Summary metadata and high-level progress indicators.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `schema_version` | `string` | Schema version (`"1.0"`). | Standard protocol version. |
| `project` | `string` | Project name (`"Xbox2PC"`). | Public project identifier. |
| `snapshot` | `string` | Semantic version string (e.g., `"0.1.0"`). | Public release tag. |
| `public_snapshot_id`| `string` | Pseudonymous snapshot identifier (e.g., `"pub_0.1.0_a297ebf4ae18"`). | Non-reversible random snapshot token; exposes no internal database paths. |
| `generated_at` | `string` | ISO 8601 UTC timestamp of export. | Temporal audit record. |
| `discovery` | `object` | Aggregate discovery metrics: | |
| `discovery.total_components` | `integer` | Discovered symbols, containers, and modules. | Aggregate count; exposes zero binary code or file bytes. |
| `discovery.physical_binaries` | `integer` | Number of scanned PE binary files. | High-level file count. |
| `discovery.logical_libraries` | `integer` | Number of identified logical library modules. | Aggregate library count. |
| `discovery.unique_exports` | `integer` | Count of unique exported function symbols. | Aggregate count of public entrypoints. |
| `discovery.unique_imports` | `integer` | Count of unique imported function symbols. | Aggregate count of required dependencies. |
| `discovery.unique_shader_instructions` | `integer` | Count of unique RDNA2 shader mnemonics. | Aggregate count of hardware instruction types. |
| `discovery.decoded_shader_occurrences` | `integer` | Total decoded instruction instances. | Aggregate occurrence tally. |
| `coverage` | `object` | Progress across pipeline stages: | |
| `coverage.global` | `null` | Theoretical Scarlett universe coverage. | Always `null` (displayed as `Unknown`). Prevents false progress claims. |
| `coverage.discovery` | `object` | Discovery completion (`completed`, `known`, `percentage`). | Explicitly marks `known: null` (Unknown denominator). |
| `coverage.analysis` | `object` | Analysis completion against discovered surface. | Fully documented numerator/denominator ratio. |
| `coverage.specification`| `object` | Reference specification coverage. | Ratio of documented APIs vs discovered surface. |
| `coverage.implementation`| `object` | Functional implementation coverage. | Strict 0.0%; stubs are strictly excluded. |
| `coverage.testing` | `object` | Automated unit test coverage. | Parser & utility test tally. |
| `coverage.validation` | `object` | Behavioral hardware validation coverage. | Hardware-verified implementation ratio. |
| `project_info` | `object` | Public project description, architecture targets, and known limitations. | Public documentation context. |

---

### `coverage.json`

Detailed progress tracking with explicit anti-inflation semantics.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `schema_version` | `string` | Protocol version (`"1.0"`). | Standard protocol version. |
| `generated_at` | `string` | ISO 8601 UTC timestamp. | Temporal audit record. |
| `snapshot` | `string` | Version identifier. | Version tag. |
| `public_snapshot_id`| `string` | Snapshot identifier. | Non-reversible identifier. |
| `metrics` | `object` | Detailed metrics dictionary (`discovery`, `analysis`, `specification`, `implementation`, `testing`, `validation`). | |
| `metrics.*.name` | `string` | Human-readable metric title. | Public UI label. |
| `metrics.*.numerator` | `integer` | Completed items count. | Transparent integer count. |
| `metrics.*.denominator` | `integer \| null` | Total reference universe count (`null` if unknown). | Enforces technical honesty. Prevents false 0% or 100%. |
| `metrics.*.percentage` | `float \| null` | Exact percentage (`null` if denominator is `null`). | Mathematical ratio without rounding distortion. |
| `metrics.*.display_string` | `string` | Display representation (e.g. `"99.97%"` or `"Unknown"`). | Standardized user interface string. |
| `metrics.*.reference_universe` | `string` | Universe definition (e.g. `"Discovered Workspace Components"`). | Clarifies the exact scope of the metric. |
| `metrics.*.is_global_unknown`| `boolean` | Flag indicating whether denominator is theoretically open. | UI guard flag. |
| `metrics.*.description` | `string` | Methodological description of how the metric is measured. | Academic methodology documentation. |

---

### `library_stats.json`

Logical library and subsystem breakdown.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `libraries` | `array[object]`| List of identified public library modules. | |
| `libraries[].name` | `string` | Library identifier (e.g., `"amd_fidelityfx_upscaler_xbox.dll"`). | Approved public platform library name. |
| `libraries[].subsystem` | `string` | Subsystem category (e.g., `"Graphics and display pipeline"`). | Architectural classification. |
| `libraries[].category` | `string` | Primary module category (`"Library"` or `"Engine Module"`). | High-level taxonomy. |
| `libraries[].total_components`| `integer` | Symbols and components inside the module. | Aggregate count. |
| `libraries[].exports_count` | `integer` | Number of exported function entrypoints. | Aggregate count. |
| `libraries[].imports_count` | `integer` | Number of imported external dependencies. | Aggregate count. |
| `libraries[].analysis_coverage`| `float` | Analysis percentage for this library. | Analytical completion metric. |
| `libraries[].implementation_status`| `string` | Implementation state (`"Not Implemented"`). | Factual lifecycle status. |
| `subsystems` | `array[object]`| Aggregate subsystem breakdown (`subsystem`, `components_count`, `library_count`). | High-level architectural summary. |

---

### `shader_stats.json`

AMD RDNA2 GPU instruction set catalog and occurrences.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `architecture` | `string` | Target GPU architecture (`"AMD RDNA2 (GFX10.3 / Scarlett)"`). | Public hardware ISA reference. |
| `summary` | `object` | Total unique instructions, formats, and operand combinations. | Aggregate ISA complexity metrics. |
| `families` | `array[object]`| Instruction groups (e.g. `"SOPP"`, `"VOP3"`, `"SMEM"`). | Standard AMD ISA family names. |
| `families[].family` | `string` | ISA family mnemonic group. | Published AMD RDNA2 ISA specification. |
| `families[].occurrences` | `integer` | Total decoded instances across analyzed shaders. | Aggregate statistical frequency. |
| `families[].unique_mnemonics`| `integer` | Unique instruction names in this family. | Aggregate instruction variety count. |
| `families[].description` | `string` | Architectural explanation of the instruction family. | Public hardware documentation. |
| `families[].mnemonics` | `array[object]`| Documented mnemonics (`name`, `occurrences`, `format`, `description`). | Published ISA mnemonic references (e.g. `s_waitcnt`, `v_fma_f32`). Zero shader bytecode or shader source. |
| `formats` | `array[object]`| Instruction encoding formats and frequencies. | Hardware encoding distribution. |

---

### `dependency_stats.json`

Module relationship topology and unresolved external targets.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `summary` | `object` | Graph summary (`total_edges`, `resolved_edges`, `unresolved_edges`, `circular_cycles`). | Topology summary; zero binary code. |
| `unresolved_platform_targets`| `array[object]`| External platform targets required by binaries (e.g. `d3d12_xs.dll`, `xmem.dll`, `XAudio2_9.dll`). | Standard Microsoft GDK / DirectX 12 platform dependencies. |
| `relationships` | `array[object]`| Directed import/export edges between modules (`source`, `target`, `edge_type`, `resolved`, `notes`). | High-level architectural dependency graph. |

---

### `catalog.json`

Publicly documented API reference catalog.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `items` | `array[object]`| Publicly documented APIs and interfaces. | |
| `items[].id` | `string` | Stable reference ID (e.g., `REF-D3D12-001`). | Public reference identifier. |
| `items[].name` | `string` | Function or interface name (e.g., `D3D12CreateDevice`). | Publicly documented Microsoft API. |
| `items[].type` | `string` | API classification (`"API Function"`, `"COM Interface"`). | Standard programming terminology. |
| `items[].category` | `string` | Origin provenance (`"Microsoft GDK / D3D12 Documentation"`). | Documented public source. |
| `items[].subsystem` | `string` | Platform subsystem (`"DirectX 12 Graphics Subsystem"`). | Architectural category. |
| `items[].status` | `string` | Reference status (`"Documented Reference"`). | Factual classification. |
| `items[].description` | `string` | Purpose and signature description from public docs. | Standard documentation excerpt. |

---

### `implementation_stats.json`

Implementation tracking lifecycle records and audit flags.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `summary` | `object` | Lifecycle tally across 8 distinct states. | Aggregate progress count. |
| `implementations` | `array[object]`| Component implementation records. | |
| `implementations[].component_id`| `string` | Stable component hash identifier. | Non-reversible component ID. |
| `implementations[].name` | `string` | Sanitized component name. | Public interface name. |
| `implementations[].subsystem` | `string` | Subsystem assignment. | System classification. |
| `implementations[].implementation_status`| `string` | Lifecycle state (`"Not Implemented"`, `"Stub"`). | Verified lifecycle status. |
| `implementations[].source_file` | `string` | Sanitized repository path (e.g., `src/stubs.cpp`). | All local Windows/Unix absolute paths and usernames stripped. |
| `implementations[].git_commit` | `string` | Git commit SHA association. | Public Git reference. |
| `implementations[].implementation_date`| `string` | Implementation timestamp. | Development timeline. |
| `implementations[].developer_notes` | `string` | Implementation notes and progress status. | Technical commentary. |
| `implementations[].test_summary` | `string` | Associated test count. | Aggregate test tally. |
| `implementations[].is_stub` | `boolean` | Flag marking stub status. | Guarantees stubs are not counted as complete. |
| `implementations[].flagged_for_review`| `boolean` | Flag set if source modified substantially. | Audit integrity flag. |

---

### `audit_status.json`

Independent verification audit verdict and active discrepancies.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `audit_date` | `string` | Date of independent audit (`"2026-11-20"`). | Audit timeline. |
| `verdict` | `string` | Independent audit verdict (`"PARTIALLY VERIFIED"`). | Honest academic verdict. |
| `discrepancies_count` | `integer` | Count of identified discrepancies (`5`). | Discrepancy metric. |
| `discrepancies` | `array[object]`| Complete discrepancy registry: | |
| `discrepancies[].id` | `string` | Stable discrepancy ID (`"DISC-001"` through `"DISC-005"`). | Public tracking ID. |
| `discrepancies[].category`| `string` | Technical category (e.g., `"Database Inventory"`, `"ISA Decoding"`). | Categorization. |
| `discrepancies[].title` | `string` | Descriptive title. | Technical summary. |
| `discrepancies[].status` | `string` | Resolution state (`"Identified / Pending Remediation"`). | Progress indicator. |
| `discrepancies[].impact` | `string` | Assessment of impact on project viability. | Technical impact analysis. |
| `discrepancies[].description` | `string` | Detailed technical explanation of the discrepancy. | Full transparency into scanner behaviors. |
| `discrepancies[].evidence_reference`| `string` | Audit report anchor link (e.g. `INDEPENDENT_AUDIT.md#Section-4.1`). | Verifiable cross-reference. |
| `verified_public_snapshot_id`| `string` | Verified public snapshot ID (`"pub_0.1.0_34aa5634"`). | Non-reversible snapshot token. Zero database hashes. |
| `auditor` | `string` | Audit entity description. | Accountability record. |
| `evidence_references` | `array[string]`| Supporting markdown audit reports. | Verifiable public references. |

---

### `snapshots/index.json`

Immutable audit snapshot manifest.

| Field Name | Type | Description | Safety Justification |
| :--- | :--- | :--- | :--- |
| `snapshots` | `array[object]`| Chronological array of approved public snapshots. | |
| `snapshots[].snapshot_id`| `string` | Pseudonymous snapshot identifier. | Non-reversible snapshot token. |
| `snapshots[].version` | `string` | Semantic release version. | Public version. |
| `snapshots[].timestamp` | `string` | Snapshot generation timestamp. | Audit trail. |
| `snapshots[].total_components`| `integer` | Total components recorded at that snapshot. | Historical progress record. |
| `snapshots[].analysis_coverage`| `float` | Documented analysis percentage. | Historical metric. |
| `snapshots[].status` | `string` | Snapshot approval status (`"approved"`). | Governance record. |
