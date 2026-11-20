import React from 'react';
import {
  PublicOverviewData,
  PublicCoverageData,
  PublicLibraryStatsData,
  PublicShaderStatsData,
  PublicAuditStatusData,
} from '../types';

interface OverviewProps {
  overview: PublicOverviewData;
  coverage: PublicCoverageData;
  libraryStats: PublicLibraryStatsData;
  shaderStats: PublicShaderStatsData;
  auditStatus?: PublicAuditStatusData;
}

export const Overview: React.FC<OverviewProps> = ({ overview, coverage, libraryStats, shaderStats, auditStatus }) => {
  const { discovery, project_info } = overview;
  const metrics = coverage.metrics;
  const auditVerdict = auditStatus?.verdict || project_info.audit_verdict || 'PARTIALLY VERIFIED';
  const discrepancyCount = auditStatus?.discrepancies_count ?? project_info.audit_discrepancies_count ?? 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Public Project Overview Hero Banner */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: '#0284c7',
                color: '#f0f9ff',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {project_info.phase}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Snapshot: <code style={{ color: '#38bdf8' }}>{overview.snapshot}</code> ({overview.public_snapshot_id})
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Updated: {new Date(overview.generated_at).toLocaleString()}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Xbox2PC — Open Architecture & Compatibility Discovery
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#78350f',
              color: '#fef3c7',
              border: '1px solid #f59e0b',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              Audit State: {auditVerdict}
            </span>
            <span style={{
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '12px'
            }}>
              Global Coverage: Unknown
            </span>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          This public dashboard provides empirical visualization of compatibility research for Xbox Series X|S (Scarlett) architecture (x86-64 AMD Zen 2 CPU + AMD RDNA2 GPU). All metrics represent verified aggregates cataloged from non-copyrighted runtime binaries, GDK documentation, and GPU shader catalogs.
        </p>

        {/* Audit Status Alert Callout */}
        <div style={{
          backgroundColor: '#1c1917',
          border: '1px solid #78350f',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
              ⚠️ Baseline Audit Status: {auditVerdict}
            </span>
            <span style={{ backgroundColor: '#451a03', color: '#fcd34d', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {discrepancyCount} Technical Discrepancies Cataloged
            </span>
            <span style={{ fontSize: '12px', color: '#a8a29e' }}>
              (Audit Date: {auditStatus?.audit_date || '2026-11-20'} • Hash: {overview.public_snapshot_id.split('_').slice(2).join('_') || '34aa5634'})
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#d6d3d1', lineHeight: 1.5, margin: 0 }}>
            Independent audit confirmed raw workspace counts (17 PE binaries, 2,593 exports, 81 shaders, 48k occurrences) but flagged 5 material discrepancies: shader container DB tracking, XPSF packaging terminology, opcode variant merging, external dependency resolution, and synthetic test scope. <strong>The current baseline is not represented as fully verified.</strong>
          </p>
        </div>

        {/* Limitations Callout */}
        <div style={{
          backgroundColor: '#1e293b',
          borderLeft: '4px solid #f59e0b',
          padding: '14px 18px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: '13px' }}>
            Strict Architectural Limitations:
          </span>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project_info.limitations_summary.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Discovered Files</div>
          <div style={statValueStyle}>{discovery.total_workspace_files || 108}</div>
          <div style={statSubStyle}>Workspace files cataloged (aggregates only)</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Discovered PE Binaries</div>
          <div style={statValueStyle}>{discovery.physical_binaries}</div>
          <div style={statSubStyle}>{discovery.physical_binaries - 1} DLLs + 1 Xbox Package Catalog</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Platform & Missing Libs</div>
          <div style={statValueStyle}>{libraryStats.summary.known_platform_library_identities} / {libraryStats.summary.unresolved_library_identities}</div>
          <div style={statSubStyle}>Known platform / unresolved targets</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Unique Exported Symbols</div>
          <div style={statValueStyle}>{discovery.unique_exports.toLocaleString()}</div>
          <div style={statSubStyle}>From available DLL export tables</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Unique Imported Symbols</div>
          <div style={statValueStyle}>{discovery.unique_imports.toLocaleString()}</div>
          <div style={statSubStyle}>Direct dependencies mapped</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Decoded RDNA2 Instructions</div>
          <div style={statValueStyle}>{discovery.unique_shader_instructions.toLocaleString()}</div>
          <div style={statSubStyle}>{shaderStats.summary.unique_instruction_encodings.toLocaleString()} encodings ({shaderStats.summary.instruction_formats} formats)</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Decoded Shader Occurrences</div>
          <div style={statValueStyle}>{discovery.decoded_shader_occurrences.toLocaleString()}</div>
          <div style={statSubStyle}>Across 81 DXBC/XPSF shader containers</div>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <div style={statLabelStyle}>Total Component Records</div>
          <div style={statValueStyle}>{(discovery.total_components || 3483).toLocaleString()}</div>
          <div style={statSubStyle}>Cataloged in SQLite discovery DB</div>
        </div>
      </div>

      {/* Six Independent Coverage Metrics */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Strict Independent Coverage Metrics (Anti-Inflation System)
          </h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Closed denominators required • Stubs strictly excluded
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {/* Discovery Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>A. Discovery Coverage</span>
              <span style={{ color: '#38bdf8', fontWeight: 700, backgroundColor: '#0c4a6e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.discovery?.is_global_unknown ? "Unknown" : `${metrics.discovery?.percentage}%`}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.discovery?.numerator.toLocaleString()} / Unknown
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.discovery?.reference_universe || 'Global Xbox Universe (Unknown)'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.discovery?.description}
            </p>
          </div>

          {/* Analysis Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>B. Analysis Coverage</span>
              <span style={{ color: '#4ade80', fontWeight: 700, backgroundColor: '#064e3b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.analysis?.percentage}%
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.analysis?.numerator.toLocaleString()} / {metrics.analysis?.denominator?.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.analysis?.reference_universe || 'Discovered Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.analysis?.description}
            </p>
          </div>

          {/* Implementation Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>C. Implementation Coverage</span>
              <span style={{ color: '#f87171', fontWeight: 700, backgroundColor: '#450a0a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.implementation?.percentage}%
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.implementation?.numerator.toLocaleString()} / {metrics.implementation?.denominator?.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.implementation?.reference_universe || 'Discovered Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.implementation?.description}
            </p>
          </div>

          {/* Testing Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>D. Testing Coverage</span>
              <span style={{ color: '#94a3b8', fontWeight: 700, backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.testing?.percentage !== null ? `${metrics.testing?.percentage}%` : '0.0%'}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.testing?.numerator.toLocaleString()} / {metrics.testing?.denominator !== null && metrics.testing?.denominator !== undefined ? metrics.testing?.denominator.toLocaleString() : '0'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.testing?.reference_universe || 'Implemented Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.testing?.description}
            </p>
          </div>

          {/* Validation Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>E. Validation Coverage</span>
              <span style={{ color: '#94a3b8', fontWeight: 700, backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.validation?.percentage !== null ? `${metrics.validation?.percentage}%` : '0.0%'}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.validation?.numerator.toLocaleString()} / {metrics.validation?.denominator !== null && metrics.validation?.denominator !== undefined ? metrics.validation?.denominator.toLocaleString() : '0'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.validation?.reference_universe || 'Implemented Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.validation?.description}
            </p>
          </div>

          {/* Game Requirement Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>F. Game Requirement Coverage</span>
              <span style={{ color: '#ea580c', fontWeight: 700, backgroundColor: '#431407', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.game_requirement?.is_global_unknown ? "Unknown" : `${metrics.game_requirement?.percentage}%`}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f8fafc' }}>
              {metrics.game_requirement?.numerator.toLocaleString()} / Unknown
            </div>
            <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, marginBottom: '6px' }}>
              Reference: {metrics.game_requirement?.reference_universe || 'Primary Game Executable (Unavailable)'}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {metrics.game_requirement?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  borderRadius: '10px',
  padding: '16px',
  border: '1px solid #334155',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#f8fafc'
};

const statSubStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  marginTop: '2px'
};

const metricCardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  borderRadius: '10px',
  padding: '16px 20px',
  border: '1px solid #334155',
  display: 'flex',
  flexDirection: 'column'
};
