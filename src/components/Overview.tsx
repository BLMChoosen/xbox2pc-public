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

export const Overview: React.FC<OverviewProps> = ({ overview, coverage, libraryStats, shaderStats, auditStatus: _auditStatus }) => {
  const { discovery, project_info } = overview;
  const metrics = coverage.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Public Project Overview Hero Banner */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f24',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: '#2b070b',
                color: '#f87171',
                border: '1px solid #7f1d1d',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {project_info.phase}
              </span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>
                Snapshot: <code style={{ color: '#ef4444' }}>{overview.snapshot}</code> ({overview.public_snapshot_id})
              </span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>
                Updated: {new Date(overview.generated_at).toLocaleString()}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
              Xbox2PC: Architecture & Compatibility Discovery
            </h2>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
          Empirical compatibility research and user-mode runtime foundations for the Xbox Series X|S (Scarlett) architecture (x86-64 AMD Zen 2 CPU + AMD RDNA2 GPU). Metrics are cataloged directly from non-copyrighted runtime binaries, GDK platform specifications, and decoded GPU shader containers.
        </p>

        {/* Technical Bounds & Constraints */}
        <div style={{
          backgroundColor: '#100305',
          border: '1px solid #3b0d14',
          borderLeft: '4px solid #ef4444',
          padding: '14px 18px',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontWeight: 600, color: '#f87171', fontSize: '13px' }}>
            System Constraints & Architecture Bounds:
          </span>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

      {/* Independent Coverage Metrics */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            System Coverage Metrics
          </h2>
          <span style={{ fontSize: '12px', color: '#71717a' }}>
            Lifecycle tracking across discovered interfaces, implementation, and verification
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
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>A. Discovered Interfaces</span>
              <span style={{ color: '#f87171', fontWeight: 700, backgroundColor: '#2b070b', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.discovery?.is_global_unknown ? "Universe Open" : `${metrics.discovery?.percentage}%`}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.discovery?.numerator.toLocaleString()} / Dynamic Surface
            </div>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.discovery?.reference_universe || 'Global Xbox Architecture'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.discovery?.description}
            </p>
          </div>

          {/* Analysis Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>B. Binary & Shader Analysis</span>
              <span style={{ color: '#f87171', fontWeight: 700, backgroundColor: '#2b070b', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.analysis?.percentage}%
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.analysis?.numerator.toLocaleString()} / {metrics.analysis?.denominator?.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.analysis?.reference_universe || 'Discovered Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.analysis?.description}
            </p>
          </div>

          {/* Implementation Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>C. Runtime Implementation</span>
              <span style={{ color: '#fca5a5', fontWeight: 700, backgroundColor: '#1f0709', border: '1px solid #520810', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.implementation?.percentage}%
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.implementation?.numerator.toLocaleString()} / {metrics.implementation?.denominator?.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.implementation?.reference_universe || 'Discovered Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.implementation?.description}
            </p>
          </div>

          {/* Testing Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>D. Automated Testing</span>
              <span style={{ color: '#a1a1aa', fontWeight: 700, backgroundColor: '#141417', border: '1px solid #27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.testing?.percentage !== null ? `${metrics.testing?.percentage}%` : '0.0%'}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.testing?.numerator.toLocaleString()} / {metrics.testing?.denominator !== null && metrics.testing?.denominator !== undefined ? metrics.testing?.denominator.toLocaleString() : '0'}
            </div>
            <div style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.testing?.reference_universe || 'Implemented Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.testing?.description}
            </p>
          </div>

          {/* Validation Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>E. Hardware Trace Validation</span>
              <span style={{ color: '#a1a1aa', fontWeight: 700, backgroundColor: '#141417', border: '1px solid #27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.validation?.percentage !== null ? `${metrics.validation?.percentage}%` : '0.0%'}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.validation?.numerator.toLocaleString()} / {metrics.validation?.denominator !== null && metrics.validation?.denominator !== undefined ? metrics.validation?.denominator.toLocaleString() : '0'}
            </div>
            <div style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.validation?.reference_universe || 'Implemented Components'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.validation?.description}
            </p>
          </div>

          {/* Game Requirement Coverage */}
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>F. Primary Target Requirements</span>
              <span style={{ color: '#fca5a5', fontWeight: 700, backgroundColor: '#2b070b', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {metrics.game_requirement?.is_global_unknown ? "Dynamic Target" : `${metrics.game_requirement?.percentage}%`}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#f4f4f5' }}>
              {metrics.game_requirement?.numerator.toLocaleString()} / Target Executable
            </div>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginBottom: '6px' }}>
              Scope: {metrics.game_requirement?.reference_universe || 'Target Executable Interface'}
            </div>
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
              {metrics.game_requirement?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  borderRadius: '6px',
  padding: '16px',
  border: '1px solid #1f1f24',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#f4f4f5'
};

const statSubStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#52525b',
  marginTop: '2px'
};

const metricCardStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  borderRadius: '6px',
  padding: '16px 20px',
  border: '1px solid #1f1f24',
  display: 'flex',
  flexDirection: 'column'
};
