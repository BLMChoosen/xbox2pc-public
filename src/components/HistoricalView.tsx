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
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
          Historical Snapshots & Discovery Timeline
        </h2>
        <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
          Auditable discovery records. Published historical snapshots are cryptographically sealed.
        </p>
      </div>

      {/* Historical Discovery Growth Chart */}
      <div style={{
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        padding: '20px',
        border: '1px solid #1f1f24',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            Discovery Inventory Growth Across Snapshots
          </h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span>
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
                  <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#1f1f24" strokeDasharray="3 3" />
                  <text x={-10} y={y + 4} fill="#71717a" fontSize="10px" textAnchor="end">
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
                  <line y2={6} stroke="#27272a" />
                  <text y={18} fill="#a1a1aa" fontSize="10px" textAnchor="middle">
                    {d.timestamp}
                  </text>
                  <text y={30} fill="#71717a" fontSize="9px" textAnchor="middle">
                    {d.id.slice(0, 14)}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path
              d={`${pathTotal} L ${getX(chartData.length - 1)} ${innerHeight} L ${getX(0)} ${innerHeight} Z`}
              fill="rgba(239, 68, 68, 0.06)"
            />

            {/* Total Components Line */}
            <path d={pathTotal} fill="none" stroke="#ef4444" strokeWidth={2.5} />

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
                  fill={isSelected ? '#f4f4f5' : '#ef4444'}
                  stroke={isSelected ? '#b91c1c' : '#050505'}
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
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        padding: '16px 20px',
        border: '1px solid #1f1f24',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            Compare Historical Snapshots
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <span style={{ color: '#71717a' }}>Compare baseline against:</span>
            <select
              value={compareSnapshot?.snapshot_id || ''}
              onChange={e => {
                const s = snapshots.find(item => item.snapshot_id === e.target.value) || null;
                setCompareSnapshot(s);
              }}
              style={{
                backgroundColor: '#121215',
                color: '#f4f4f5',
                border: '1px solid #27272a',
                padding: '6px 10px',
                borderRadius: '4px',
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
            backgroundColor: '#121215',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid #27272a',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: '#71717a' }}>Total Components Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: selectedSnapshot.total_components >= compareSnapshot.total_components ? '#ef4444' : '#fca5a5' }}>
                {selectedSnapshot.total_components - compareSnapshot.total_components >= 0 ? '+' : ''}
                {selectedSnapshot.total_components - compareSnapshot.total_components}
              </div>
            </div>
            <div>
              <div style={{ color: '#71717a' }}>Unique Exports Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>
                {selectedSnapshot.unique_exports - compareSnapshot.unique_exports >= 0 ? '+' : ''}
                {selectedSnapshot.unique_exports - compareSnapshot.unique_exports}
              </div>
            </div>
            <div>
              <div style={{ color: '#71717a' }}>Unique Imports Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>
                {selectedSnapshot.unique_imports - compareSnapshot.unique_imports >= 0 ? '+' : ''}
                {selectedSnapshot.unique_imports - compareSnapshot.unique_imports}
              </div>
            </div>
            <div>
              <div style={{ color: '#71717a' }}>Shader Instructions Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>
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
                backgroundColor: isSelected ? '#120406' : '#0a0a0c',
                border: isSelected ? '1px solid #7f1d1d' : '1px solid #1f1f24',
                borderRadius: '6px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ef4444', fontSize: '13px' }}>
                  {s.snapshot_id}
                </span>
                <span style={{
                  backgroundColor: '#2b070b',
                  color: '#f87171',
                  border: '1px solid #7f1d1d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>
                Timestamp: {new Date(s.timestamp).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', marginTop: '4px' }}>
                <span>Components: <strong style={{ color: '#f4f4f5' }}>{s.total_components}</strong></span>
                <span>Exports: <strong style={{ color: '#f4f4f5' }}>{s.unique_exports}</strong></span>
                <span>Shaders: <strong style={{ color: '#f4f4f5' }}>{s.unique_shader_instructions}</strong></span>
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                {s.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
