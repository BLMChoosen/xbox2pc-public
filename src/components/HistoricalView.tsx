import React, { useState } from 'react';
import { PublicSnapshotIndexData, PublicSnapshotItem } from '../types';

interface HistoricalViewProps {
  data: PublicSnapshotIndexData;
}

export const HistoricalView: React.FC<HistoricalViewProps> = ({ data }) => {
  const { snapshots } = data;
  const [selectedSnapshot, setSelectedSnapshot] = useState<PublicSnapshotItem | null>(
    snapshots[snapshots.length - 1] || snapshots[0] || null
  );
  const [compareSnapshot, setCompareSnapshot] = useState<PublicSnapshotItem | null>(null);

  // Extract snapshot timeline data for SVG chart
  const chartData = snapshots.map((s, idx) => ({
    version: s.version,
    id: s.snapshot_id,
    index: idx,
    timestamp: s.timestamp.slice(0, 10),
    totalComponents: s.total_components,
    exports: s.unique_exports,
    shaders: s.unique_shader_instructions,
    analysisCoverage: s.analysis_coverage,
    snapshot: s
  }));

  // SVG Chart Dimensions
  const svgWidth = 860;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...chartData.map(d => d.totalComponents), 10);
  const getY = (val: number) => innerHeight - (val / maxVal) * innerHeight;
  const getX = (idx: number) => chartData.length > 1 ? (idx / (chartData.length - 1)) * innerWidth : innerWidth / 2;

  // Build SVG Path for total components
  const pathTotal = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.totalComponents)}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
          Historical Snapshots & Discovery Timeline
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Immutable, auditable discovery records. Published historical snapshots are cryptographically sealed and never overwritten.
        </p>
      </div>

      {/* Historical Discovery Growth Chart */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '10px',
        padding: '20px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Discovery Inventory Growth Across Immutable Snapshots
          </h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></span>
              Total Discovered Components
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto' }}>
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = innerHeight * pct;
              const labelVal = Math.round(maxVal * (1 - pct));
              return (
                <g key={i}>
                  <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#334155" strokeDasharray="3 3" />
                  <text x={-10} y={y + 4} fill="#64748b" fontSize="10px" textAnchor="end">
                    {labelVal.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* X-axis ticks & labels */}
            {chartData.map((d, i) => {
              const x = getX(i);
              return (
                <g key={i} transform={`translate(${x}, ${innerHeight})`}>
                  <line y2={6} stroke="#475569" />
                  <text y={18} fill="#94a3b8" fontSize="10px" textAnchor="middle">
                    {d.timestamp}
                  </text>
                  <text y={30} fill="#64748b" fontSize="9px" textAnchor="middle">
                    {d.id.slice(0, 14)}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path
              d={`${pathTotal} L ${getX(chartData.length - 1)} ${innerHeight} L ${getX(0)} ${innerHeight} Z`}
              fill="rgba(56, 189, 248, 0.1)"
            />

            {/* Total Components Line */}
            <path d={pathTotal} fill="none" stroke="#38bdf8" strokeWidth={2.5} />

            {/* Data Points */}
            {chartData.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.totalComponents);
              const isSelected = selectedSnapshot?.snapshot_id === d.id;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#f8fafc' : '#38bdf8'}
                  stroke={isSelected ? '#0284c7' : '#0f172a'}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSnapshot(d.snapshot)}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Snapshot Comparison Tool */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '10px',
        padding: '16px 20px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Compare Historical Snapshots
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Compare baseline against:</span>
            <select
              value={compareSnapshot?.snapshot_id || ''}
              onChange={e => {
                const s = snapshots.find(item => item.snapshot_id === e.target.value) || null;
                setCompareSnapshot(s);
              }}
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
              <option value="">(Select comparison snapshot)</option>
              {snapshots.map(s => (
                <option key={s.snapshot_id} value={s.snapshot_id}>
                  {s.snapshot_id} ({s.timestamp.slice(0, 10)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {compareSnapshot && selectedSnapshot && (
          <div style={{
            backgroundColor: '#0f172a',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #334155',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: '#94a3b8' }}>Total Components Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: selectedSnapshot.total_components >= compareSnapshot.total_components ? '#4ade80' : '#f87171' }}>
                {selectedSnapshot.total_components - compareSnapshot.total_components >= 0 ? '+' : ''}
                {selectedSnapshot.total_components - compareSnapshot.total_components}
              </div>
            </div>
            <div>
              <div style={{ color: '#94a3b8' }}>Unique Exports Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
                {selectedSnapshot.unique_exports - compareSnapshot.unique_exports >= 0 ? '+' : ''}
                {selectedSnapshot.unique_exports - compareSnapshot.unique_exports}
              </div>
            </div>
            <div>
              <div style={{ color: '#94a3b8' }}>Unique Imports Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
                {selectedSnapshot.unique_imports - compareSnapshot.unique_imports >= 0 ? '+' : ''}
                {selectedSnapshot.unique_imports - compareSnapshot.unique_imports}
              </div>
            </div>
            <div>
              <div style={{ color: '#94a3b8' }}>Shader Instructions Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
                {selectedSnapshot.unique_shader_instructions - compareSnapshot.unique_shader_instructions >= 0 ? '+' : ''}
                {selectedSnapshot.unique_shader_instructions - compareSnapshot.unique_shader_instructions}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Snapshot Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {snapshots.map(s => {
          const isSelected = selectedSnapshot?.snapshot_id === s.snapshot_id;
          return (
            <div
              key={s.snapshot_id}
              onClick={() => setSelectedSnapshot(s)}
              style={{
                backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                border: isSelected ? '2px solid #0284c7' : '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>
                  {s.snapshot_id}
                </span>
                <span style={{
                  backgroundColor: '#064e3b',
                  color: '#6ee7b7',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Timestamp: {new Date(s.timestamp).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', marginTop: '4px' }}>
                <span>Components: <strong style={{ color: '#f8fafc' }}>{s.total_components}</strong></span>
                <span>Exports: <strong style={{ color: '#f8fafc' }}>{s.unique_exports}</strong></span>
                <span>Shaders: <strong style={{ color: '#f8fafc' }}>{s.unique_shader_instructions}</strong></span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {s.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
