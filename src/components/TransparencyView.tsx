import React from 'react';
import { PublicAuditStatusData } from '../types';

interface TransparencyViewProps {
  auditStatus?: PublicAuditStatusData;
}

export const TransparencyView: React.FC<TransparencyViewProps> = ({ auditStatus }) => {
  const discrepancies = auditStatus?.discrepancies || [
    {
      id: "DISC-005",
      category: "Testing Verification",
      title: "Automated Testing Scope vs Behavioral Compatibility",
      status: "Identified / Documented",
      impact: "Testing Scope Boundary",
      description: "Passing test suite covers scanner parser utility functions and data model validation. Unit test execution does not execute x86-64 machine instructions or prove binary execution compatibility.",
      evidence_reference: "INDEPENDENT_AUDIT.md#Section-6.1"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Data Transparency, Methodology & Engineering Integrity
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '6px 0 0 0', lineHeight: 1.5 }}>
          This document explains the empirical basis of the Xbox2PC discovery dashboard, how metrics are computed, what is excluded for copyright and security compliance, and why conservative denominators are enforced.
        </p>
      </div>

      {/* 1. What is being measured */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>1. What Is Being Measured</h3>
        <p style={paragraphStyle}>
          The Xbox2PC discovery system inspects available runtime binaries, dynamic link libraries (DLLs), shader containers, manifests, and official Microsoft Game Development Kit (GDK) reference headers.
        </p>
        <p style={paragraphStyle}>
          Every component cataloged in the database represents a verified physical or logical entity:
        </p>
        <ul style={listStyle}>
          <li><strong>Discovered PE Binaries:</strong> Physical x86-64 portable executables and middleware dynamic libraries.</li>
          <li><strong>System Subsystems:</strong> Logical groupings (e.g., Kernel & System, Graphics & Direct3D, GPU Runtime, Audio, Networking).</li>
          <li><strong>API Symbols:</strong> Exported and imported C/C++ function symbols discovered in available binary headers.</li>
          <li><strong>GPU Instructions:</strong> Native AMD RDNA2 ISA instructions decoded from BVH raytracing and ACO compute shader bytecode containers.</li>
          <li><strong>Dependency Edges:</strong> Linkages between caller executables and target platform libraries.</li>
        </ul>
      </div>

      {/* 2. What each coverage percentage means */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>2. Coverage Metrics Explained</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '10px' }}>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#38bdf8' }}>A. Discovery Coverage (Unknown)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Measures discovered components against the total theoretical Xbox system surface. Because the global Xbox OS surface is not fully documented in a closed denominator, this is mathematically <strong>Unknown</strong>.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>B. Analysis Coverage (99.97%)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Percentage of discovered components whose interface, import/export tables, or ISA formats have been successfully analyzed and cataloged.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#f87171' }}>C. Implementation Coverage (0.0%)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Percentage of discovered components that have a complete, fully functional translation or reimplementation. Stubs are strictly excluded. Currently at 0.0% during the active discovery phase.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#94a3b8' }}>D. Testing Coverage (0.0%)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Percentage of implemented components covered by passing automated unit and integration tests.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#94a3b8' }}>E. Validation Coverage (0.0%)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Percentage of implemented components behaviorally validated against real hardware execution traces.
            </p>
          </div>
          <div style={subCardStyle}>
            <span style={{ fontWeight: 700, color: '#ea580c' }}>F. Game Requirement Coverage (Unknown)</span>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Measures coverage of the primary game executable's direct imports. Because <code>game_scarlett_master.exe</code> is absent from the workspace, this remains <strong>Unknown</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. What is excluded from public datasets */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>3. Strict Data Exclusion & Security Policy</h3>
        <p style={paragraphStyle}>
          To protect proprietary rights and maintain strict security compliance, this public repository contains <strong>ZERO proprietary game files, game assets, or private reverse-engineering payloads</strong>:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '10px' }}>
          <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '13px' }}>🚫 Excluded from Public Export:</span>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#fecaca', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Original binaries (.exe, .dll, .bin)</li>
              <li>Encrypted archives (.rpf, .xvd)</li>
              <li>Original streaming game assets (.ttpf, .pri)</li>
              <li>Raw shader bytecode (DXBC / DXIL / ACO)</li>
              <li>Extracted disassembly or decompiled code</li>
              <li>Proprietary game-specific symbol names</li>
              <li>Private file SHA-256 hashes & paths</li>
              <li>Complete private SQLite database</li>
            </ul>
          </div>
          <div style={{ backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '13px' }}>✅ Approved for Public Visualization:</span>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#a7f3d0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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

      {/* 4. Why global Xbox coverage is unknown */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>4. Why Global Xbox Coverage Is Unknown</h3>
        <p style={paragraphStyle}>
          Many compatibility dashboards create arbitrary, fabricated denominators (e.g. assuming the total Xbox OS consists of 5,000 APIs) to show an appealing "progress percentage".
        </p>
        <p style={paragraphStyle}>
          In reality, the global Xbox Series X|S operating system surface includes documented GDK APIs, private kernel interfaces, undocumented system services, title-specific extensions, and driver ordinals. Without a mathematically closed, provable denominator, reporting a percentage like "15% of Xbox implemented" is scientifically false.
        </p>
        <p style={paragraphStyle}>
          In accordance with strict anti-inflation engineering policies, <strong>Global Coverage is reported as Unknown</strong>. Denominators are only reported when the exact reference universe is closed and verifiable.
        </p>
      </div>

      {/* 5. Why discovery completeness differs from implementation completeness */}
      <div style={cardStyle}>
        <h3 style={sectionHeadingStyle}>5. Discovery Completeness vs. Implementation Completeness</h3>
        <p style={paragraphStyle}>
          <strong>Discovery and Analysis Completeness (99.97%)</strong> reflects that our automated pipeline has successfully inspected, cataloged, and mapped nearly all components present in the available binaries and middleware.
        </p>
        <p style={paragraphStyle}>
          <strong>Implementation Completeness (0.0%)</strong> measures whether translation logic, ABI shims, and functional system proxies have been written and validated.
        </p>
        <p style={paragraphStyle}>
          Having full catalog knowledge of what an API requires is completely distinct from having written the software that implements it. Confusing discovery with implementation creates a misleading illusion of progress. Stubs are never counted as implemented code.
        </p>
      </div>

      {/* 6. Independent Audit Verdict & Discrepancy Status */}
      <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ ...sectionHeadingStyle, color: '#fde68a' }}>
              6. Independent Audit Status: PARTIALLY VERIFIED
            </h3>
            <p style={{ ...paragraphStyle, color: '#fed7aa' }}>
              Audit Date: <strong>{auditStatus?.audit_date || '2026-11-20'}</strong> • Auditor: <strong>{auditStatus?.auditor || 'Independent Discovery Audit Worker'}</strong> • Verified Public Snapshot: <code style={{ color: '#fed7aa' }}>{auditStatus?.verified_public_snapshot_id || 'Not yet published'}</code>
            </p>
          </div>
          <span style={{
            backgroundColor: '#78350f',
            color: '#fef3c7',
            border: '1px solid #f59e0b',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {discrepancies.length} Discrepancies Cataloged
          </span>
        </div>

        <p style={{ ...paragraphStyle, marginTop: '8px' }}>
          <strong>Transparency Notice:</strong> The discovery baseline is <em>partially verified</em>. Inventory, shader taxonomy, and dependency resolution are regenerated from the corrected scanner. Behavioral compatibility still requires execution evidence beyond automated parser and pipeline tests.
        </p>
        <p style={{ ...paragraphStyle, color: '#94a3b8' }}>
          The dashboard is architected to display these discrepancies openly and can ingest future corrected baselines without structural changes:
        </p>

        {/* Discrepancies Table */}
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>ID</th>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>Category</th>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>Title & Description</th>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>Impact</th>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>Status</th>
                <th style={{ padding: '8px 10px', color: '#94a3b8' }}>Evidence Ref</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((disc, idx) => (
                <tr key={disc.id} style={{
                  backgroundColor: idx % 2 === 0 ? '#0f172a' : '#141e33',
                  borderBottom: '1px solid #1e293b'
                }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                    {disc.id}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#94a3b8' }}>
                    {disc.category}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{disc.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.4 }}>{disc.description}</div>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>
                    {disc.impact}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      backgroundColor: disc.status.includes('Pending') ? '#451a03' : '#1e293b',
                      color: disc.status.includes('Pending') ? '#fdba74' : '#94a3b8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {disc.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px' }}>
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
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#f8fafc',
  margin: '0 0 6px 0'
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#cbd5e1',
  lineHeight: 1.6,
  margin: 0
};

const listStyle: React.CSSProperties = {
  margin: '4px 0',
  paddingLeft: '20px',
  fontSize: '13px',
  color: '#cbd5e1',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const subCardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column'
};
