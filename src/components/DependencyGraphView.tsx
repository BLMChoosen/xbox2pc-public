import React, { useState } from 'react';
import { PublicDependencyStatsData } from '../types';

interface DependencyGraphViewProps {
  data: PublicDependencyStatsData;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [onlyUnresolved, setOnlyUnresolved] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { summary, unresolved_platform_targets, relationships } = data;

  let filtered = relationships;
  if (filterType !== 'all') {
    filtered = filtered.filter(d => d.type === filterType);
  }
  if (onlyUnresolved) {
    filtered = filtered.filter(d => !d.is_resolved);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.source.toLowerCase().includes(q) ||
      d.target.toLowerCase().includes(q) ||
      (d.notes || '').toLowerCase().includes(q)
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
          Binary & Platform API Dependency Graph Explorer
        </h2>
        <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
          Tracks direct and transitive dependencies between discovered game binaries and system libraries.
        </p>
      </div>

      {/* Dependency Metrics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Total Dependency Edges</span>
          <span style={kpiVal}>{summary.total_edges.toLocaleString()}</span>
        </div>
        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Resolved Within Workspace</span>
          <span style={{ ...kpiVal, color: '#ef4444' }}>{summary.resolved_edges.toLocaleString()}</span>
        </div>
        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Unresolved / Missing Platform</span>
          <span style={{ ...kpiVal, color: '#f87171' }}>{summary.unresolved_edges.toLocaleString()}</span>
        </div>
        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Circular Dependency Cycles</span>
          <span style={{ ...kpiVal, color: '#fca5a5' }}>{summary.circular_cycles} detected</span>
        </div>
      </div>

      {/* Critical Missing Libraries Callout */}
      <div style={{
        backgroundColor: '#120406',
        border: '1px solid #7f1d1d',
        borderRadius: '6px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <span style={{ fontWeight: 600, color: '#f87171', fontSize: '14px' }}>
          Unresolved Platform Dependencies Required by Game Middleware:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {unresolved_platform_targets.map(tgt => (
            <div key={tgt.target} style={{
              backgroundColor: '#26080b',
              color: '#fca5a5',
              border: '1px solid #7f1d1d',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <strong>{tgt.target}</strong>
              <span style={{ fontSize: '10px', color: '#f87171' }}>{tgt.subsystem} ({tgt.dependent_count} refs)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f24',
        padding: '14px 16px',
        borderRadius: '6px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search source binary, target library, or notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            backgroundColor: '#121215',
            border: '1px solid #27272a',
            color: '#f4f4f5',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            flexGrow: 1,
            minWidth: '220px'
          }}
        />

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            backgroundColor: '#121215',
            border: '1px solid #27272a',
            color: '#f4f4f5',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
          <option value="all">All Dependency Types</option>
          <option value="Direct Import">Direct Import</option>
          <option value="Delayed Load">Delayed Load</option>
          <option value="Dynamic Load">Dynamic Load</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a1a1aa', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyUnresolved}
            onChange={e => setOnlyUnresolved(e.target.checked)}
          />
          Only Unresolved Missing Targets
        </label>
      </div>

      {/* Dependency List Table */}
      <div style={{
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        border: '1px solid #1f1f24',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#121215', borderBottom: '1px solid #1f1f24', color: '#71717a' }}>
              <th style={{ padding: '12px 16px' }}>Source Binary</th>
              <th style={{ padding: '12px 16px' }}>Target Library</th>
              <th style={{ padding: '12px 16px' }}>Dependency Type</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rel, idx) => (
              <tr key={idx} style={{
                borderBottom: '1px solid #1f1f24',
                backgroundColor: idx % 2 === 0 ? 'transparent' : '#08080a'
              }}>
                <td style={{ padding: '10px 16px', color: '#f4f4f5', fontWeight: 600, fontFamily: 'monospace' }}>
                  {rel.source}
                </td>
                <td style={{ padding: '10px 16px', color: '#ef4444', fontFamily: 'monospace' }}>
                  {rel.target}
                </td>
                <td style={{ padding: '10px 16px', color: '#a1a1aa' }}>
                  {rel.type}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    backgroundColor: rel.is_resolved ? '#160406' : '#2b070b',
                    color: rel.is_resolved ? '#fca5a5' : '#f87171',
                    border: rel.is_resolved ? '1px solid #520810' : '1px solid #7f1d1d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {rel.is_resolved ? 'Resolved' : 'Missing Platform'}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', color: '#71717a', fontSize: '12px' }}>
                  {rel.notes || 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  border: '1px solid #1f1f24',
  borderRadius: '6px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const kpiLabel: React.CSSProperties = {
  fontSize: '11px',
  color: '#71717a',
  textTransform: 'uppercase',
  fontWeight: 600
};

const kpiVal: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#f4f4f5'
};
