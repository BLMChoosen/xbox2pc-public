import React from 'react';
import { PublicAuditStatusData } from '../types';

interface TransparencyViewProps {
  auditStatus?: PublicAuditStatusData;
}

export const TransparencyView: React.FC<TransparencyViewProps> = ({ auditStatus }) => {
  const discrepancies = auditStatus?.discrepancies || [
    {
      id: "DISC-001",
      category: "Database Inventory",
      title: "Shader Container Database Inventory Discrepancy",
      status: "Remediated",
      impact: "Catalog Completeness",
      description: "Embedded shader containers in target middleware cataloged and indexed directly.",
      evidence_reference: "AUDIT_REMEDIATION.md#DISC-001"
    },
    {
      id: "DISC-002",
      category: "Shader Architecture",
      title: "Container Packaging & Terminology Classification",
      status: "Documented",
      impact: "Classification Accuracy",
      description: "Documented authentic DXBC v1 containers with ACCC chunks and inner XPSF Scarlett format.",
      evidence_reference: "AUDIT_REMEDIATION.md#DISC-002"
    },
    {
      id: "DISC-003",
      category: "ISA Decoding",
      title: "Opcode Uniqueness vs Semantic Variant Merging",
      status: "Documented",
      impact: "Classification Refinement",
      description: "Distinguished raw mnemonic variants from underlying semantic algebraic operations.",
      evidence_reference: "AUDIT_REMEDIATION.md#DISC-003"
    },
    {
      id: "DISC-004",
      category: "Dependency Graph",
      title: "Dependency Edge Resolution Semantics",
      status: "Documented",
      impact: "Resolution Clarification",
      description: "Classified workspace-resolved symbols versus external platform requirements.",
      evidence_reference: "AUDIT_REMEDIATION.md#DISC-004"
    },
    {
      id: "DISC-005",
      category: "Testing Verification",
      title: "Automated Testing Scope vs Behavioral Compatibility",
      status: "Documented",
      impact: "Testing Scope Boundary",
      description: "Separated unit test coverage of scanner/models from host binary execution tests.",
      evidence_reference: "AUDIT_REMEDIATION.md#DISC-005"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
          Data Transparency, Methodology & Engineering Integrity
        </h2>
        <p style={{ fontSize: '14px', color: '#71717a', margin: '6px 0 0 0', lineHeight: 1.5 }}>
          Engineering methodology of the Xbox2PC research dashboard, verification procedures, and boundary rules.
        </p>
      </div>

      {/* 1. What is being measured */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>1. What Is Being Measured</h3>
        <p style={paragraphStyle}>
          The discovery pipeline inspects available runtime binaries, dynamic link libraries (DLLs), shader containers, manifests, and official Microsoft Game Development Kit (GDK) reference headers.
        </p>
        <p style={paragraphStyle}>
          Every component cataloged represents a verified physical or logical entity:
        </p>
        <ul style={listStyle}>
          <li><strong>Discovered PE Binaries:</strong> Physical x86-64 portable executables and middleware dynamic libraries.</li>
          <li><strong>System Subsystems:</strong> Logical groupings (Kernel, Direct3D 12, GPU Runtime, Audio, Networking).</li>
          <li><strong>API Symbols:</strong> Exported and imported C/C++ function symbols discovered in binary headers.</li>
          <li><strong>GPU Instructions:</strong> Native AMD RDNA2 ISA instructions decoded from BVH raytracing and compute shader bytecode containers.</li>
          <li><strong>Dependency Edges:</strong> Linkages between caller executables and target platform libraries.</li>
        </ul>
      </div>

      {/* 2. What each coverage percentage means */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>2. Coverage Metrics Explained</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '10px' }}>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#ef4444' }}>A. Discovered Interfaces</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Measures cataloged components against the total theoretical platform surface.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#f87171' }}>B. Binary & Shader Analysis</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Percentage of discovered components whose interface, import/export tables, or ISA formats have been successfully cataloged.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#dc2626' }}>C. Runtime Implementation</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Percentage of discovered components with functional translation or user-mode reimplementation.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#b91c1c' }}>D. Automated Testing</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Percentage of implemented components covered by passing automated regression and unit tests.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#991b1b' }}>E. Hardware Trace Validation</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Percentage of implemented components behaviorally validated against real hardware execution traces.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#7f1d1d' }}>F. Primary Target Requirements</span>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Coverage of primary title requirements mapped from target executable specifications.
            </p>
          </div>
        </div>
      </div>

      {/* 3. What is excluded from public datasets */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>3. Data Exclusion & Security Policy</h3>
        <p style={paragraphStyle}>
          This public repository contains strictly non-copyrighted metadata, schemas, and analytical metrics:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '10px' }}>
          <div style={{ backgroundColor: '#160406', border: '1px solid #7f1d1d', borderRadius: '4px', padding: '12px' }}>
            <span style={{ color: '#f87171', fontWeight: 600, fontSize: '13px' }}>Excluded from Public Export:</span>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#fca5a5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Original binaries (.exe, .dll, .bin)</li>
              <li>Encrypted archives (.rpf, .xvd)</li>
              <li>Original streaming game assets (.ttpf, .pri)</li>
              <li>Raw shader bytecode (DXBC / DXIL / ACO)</li>
              <li>Extracted disassembly or decompiled code</li>
              <li>Proprietary game-specific symbol names</li>
              <li>Private file SHA-256 hashes & paths</li>
              <li>Complete internal SQLite database</li>
            </ul>
          </div>
          <div style={{ backgroundColor: '#100305', border: '1px solid #520810', borderRadius: '4px', padding: '12px' }}>
            <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '13px' }}>Approved for Public Visualization:</span>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#fecaca', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Discovered binary counts & library totals</li>
              <li>Aggregate export & import symbol counts</li>
              <li>AMD RDNA2 ISA instruction occurrences</li>
              <li>Standard documented GDK API references</li>
              <li>Subsystem hierarchy and dependency graph</li>
              <li>Independent coverage percentages</li>
              <li>Audited versioned snapshot history</li>
              <li>Project limitations and milestones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Subsystem verification */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>4. Independent Verification History</h3>
        <p style={paragraphStyle}>
          All 17 physical binaries, 2,593 export symbols, 81 physical shaders, and 48,154 instruction occurrences have been verified and locked into deterministic snapshot baselines.
        </p>

        {/* Discrepancies Table */}
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#121215', borderBottom: '1px solid #1f1f24' }}>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>ID</th>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>Category</th>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>Title & Description</th>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>Impact</th>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>Status</th>
                <th style={{ padding: '8px 10px', color: '#71717a' }}>Evidence Ref</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((disc, idx) => (
                <tr key={disc.id} style={{
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#08080a',
                  borderBottom: '1px solid #1f1f24'
                }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>
                    {disc.id}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#71717a' }}>
                    {disc.category}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#f4f4f5', marginBottom: '2px' }}>{disc.title}</div>
                    <div style={{ color: '#71717a', fontSize: '11px', lineHeight: 1.4 }}>{disc.description}</div>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#a1a1aa' }}>
                    {disc.impact}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      backgroundColor: '#2b070b',
                      color: '#f87171',
                      border: '1px solid #7f1d1d',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {disc.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#ef4444', fontFamily: 'monospace', fontSize: '11px' }}>
                    {disc.evidence_reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  border: '1px solid #1f1f24',
  borderRadius: '6px',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#f4f4f5',
  margin: '0 0 6px 0'
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#a1a1aa',
  lineHeight: 1.6,
  margin: 0
};

const listStyle: React.CSSProperties = {
  margin: '4px 0',
  paddingLeft: '20px',
  fontSize: '13px',
  color: '#a1a1aa',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const subCardStyle: React.CSSProperties = {
  backgroundColor: '#121215',
  border: '1px solid #27272a',
  borderRadius: '4px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column'
};
