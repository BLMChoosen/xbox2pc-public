# Xbox2PC — Data Limitations & Anti-Inflation System

## 1. Executive Summary

This document specifies the technical boundaries, unknown variables, and anti-inflation principles governing the Xbox2PC discovery metrics.

To maintain scientific integrity and prevent misleading representations of software progress:
- **No speculative or estimated completion percentages are reported.**
- Stubs are permanently excluded from implementation metrics.
- Global Xbox library coverage is explicitly designated as **Unknown**.
- All metrics are strictly tied to empirically verified artifacts.

---

## 2. Six Independent Engineering Coverage Metrics

| Metric | Current Numerator | Current Denominator | Percentage | Reference Universe | Interpretation |
|---|---|---|---|---|---|
| **A. Discovery Coverage** | 3,483 | N/A | **Unknown** | Global Xbox OS Universe | No closed denominator exists for the entire Xbox OS. |
| **B. Analysis Coverage** | 3,482 | 3,483 | **99.97%** | Discovered Components | ABI interfaces and ISA opcodes cataloged. |
| **C. Implementation Coverage** | 0 | 3,483 | **0.0%** | Discovered Components | Working reimplementations (stubs excluded). |
| **D. Testing Coverage** | 0 | 0 | **0.0%** | Implemented Components | Automated unit and integration test coverage. |
| **E. Validation Coverage** | 0 | 0 | **0.0%** | Implemented Components | Hardware trace parity verification. |
| **F. Game Requirement Coverage** | 0 | N/A | **Unknown** | Target Executable Imports | Primary executable absent from workspace. |

---

## 3. Why Global Xbox Coverage is "Unknown"

A common flaw in compatibility projects is fabricating a global denominator (e.g. inventing an arbitrary number like 5,000 APIs) to show arbitrary progress percentages.

In the Xbox Series X|S operating system:
1. Microsoft's Game Development Kit (GDK) documents a substantial subset of user-mode APIs.
2. Direct3D 12 Scarlett extensions (`d3d12_xs.dll`) include proprietary hardware raytracing extensions and low-level dispatch ordinals.
3. Title-specific system libraries and internal kernel services include undocumented ordinals not present in public header files.

Because the total Xbox OS universe is unclosed, calculating a "Global Progress %" would be mathematically invalid. Global coverage must remain **Unknown**.

---

## 4. Discovery Completeness vs. Implementation Completeness

- **Discovery Completeness (99.97%)**: Measures the progress of our automated scanner in parsing, identifying, and cataloging the functions, classes, and shader instructions present in the workspace binaries.
- **Implementation Completeness (0.0%)**: Measures functional code written to translate or execute those functions on PC.

Having a complete blueprint of an engine does not mean the engine has been built. The two metrics are strictly decoupled.

---

## 5. Technical Limitations of Available Workspace Artifacts

1. **Primary Executable Absent**: The main game binary (`game_scarlett_master.exe`) referenced in `MicrosoftGame.Config` is absent from the workspace. Direct game import tables cannot be established until the binary is available.
2. **RPF9 Container Encryption**: Workspace `.rpf` archives (including `shaders.rpf`, 411 MB) utilize RPF9 encryption (AES-CTR/CBC). Per security guidelines, DRM/encryption bypass is not performed.
3. **XVD Virtual Disk**: `gameos.xvd` (348 MB) has a valid `msft-xvd` header; internal partitions remain encrypted without platform keys.
4. **Stubs Permanently Excluded**: In Xbox2PC, creating empty stub functions (`return 0;` or `NOT_IMPLEMENTED()`) is treated as a testing aid, **never as completed implementation progress**.
