import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PublicLibraryStatsData, PublicLibraryItem } from '../types';

interface LibraryTreemapProps {
  data: PublicLibraryStatsData;
  filterSubsystem?: string;
}

export const LibraryTreemap: React.FC<LibraryTreemapProps> = ({ data, filterSubsystem }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<PublicLibraryItem | null>(null);
  const [subsystemFilter, setSubsystemFilter] = useState<string>(filterSubsystem || 'all');
  const [viewMode, setViewMode] = useState<'matrix' | 'treemap'>('matrix');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [zoomedSubsystem, setZoomedSubsystem] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ targetItem: PublicLibraryItem; x: number; y: number } | null>(null);

  const availableSubsystems = useMemo(() => {
    return Array.from(new Set(
      data.libraries.map(c => c.subsystem || 'Other unidentified subsystems')
    )).sort();
  }, [data]);

  const filteredLibraries = useMemo(() => {
    let list = data.libraries;
    if (subsystemFilter !== 'all') {
      list = list.filter(c => c.subsystem === subsystemFilter);
    }
    if (zoomedSubsystem) {
      list = list.filter(c => c.subsystem === zoomedSubsystem);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.subsystem && c.subsystem.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, subsystemFilter, zoomedSubsystem, searchTerm]);

  // D3 Treemap Effect (for Treemap Mode)
  useEffect(() => {
    if (viewMode !== 'treemap' || !svgRef.current) return;

    const width = 960;
    const height = 540;

    // Group by subsystem
    const subsystemMap: Record<string, PublicLibraryItem[]> = {};
    filteredLibraries.forEach(lib => {
      const sub = lib.subsystem || 'Other unidentified subsystems';
      if (!subsystemMap[sub]) subsystemMap[sub] = [];
      subsystemMap[sub].push(lib);
    });

    const hierarchyData = {
      name: 'All Subsystems',
      children: Object.entries(subsystemMap).map(([sub, libs]) => ({
        name: sub,
        children: libs.map(lib => ({
          name: lib.name,
          subsystem: sub,
          exportsCount: lib.exports_count,
          // Using square root scaling to balance large libraries (msvcp140) with smaller ones
          value: Math.sqrt(Math.max(lib.exports_count, 1)) + 6,
          component: lib
        }))
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<any>()
      .size([width, height])
      .paddingTop(24)
      .paddingRight(4)
      .paddingBottom(4)
      .paddingLeft(4)
      .paddingInner(3)(root as any);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .style('width', '100%')
       .style('height', 'auto')
       .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');

    const defs = svg.append('defs');

    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Depth 1: Subsystem boxes
    nodes.filter((d: any) => d.depth === 1)
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', '#0a0a0c')
      .attr('stroke', '#27272a')
      .attr('stroke-width', 1.5)
      .attr('rx', 4);

    // Subsystem Header Text
    nodes.filter((d: any) => d.depth === 1)
      .append('text')
      .attr('x', 8)
      .attr('y', 16)
      .text((d: any) => `${d.data.name} (${d.children ? d.children.length : 0})`)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#22c55e')
      .style('cursor', 'pointer')
      .on('click', (_, d: any) => {
        setZoomedSubsystem(zoomedSubsystem === d.data.name ? null : d.data.name);
      });

    // Depth 2: Library leaves
    const leafNodes = nodes.filter((d: any) => d.depth === 2);

    // Add unique clip-path for each leaf
    leafNodes.each(function(d: any, i: number) {
      const clipId = `clip-lib-${i}`;
      defs.append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('width', Math.max(0, d.x1 - d.x0 - 4))
        .attr('height', Math.max(0, d.y1 - d.y0 - 4))
        .attr('rx', 3);
    });

    leafNodes.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => {
        const c: PublicLibraryItem = d.data.component;
        const isSelected = selectedNode?.name === c.name;
        if (isSelected) return '#4ade80';
        if (!c.is_physical) return '#27272a'; // Gray for missing exe
        return '#15803d'; // AnyPS5 Green for physical DLLs
      })
      .attr('stroke', (d: any) => {
        const c: PublicLibraryItem = d.data.component;
        const isSelected = selectedNode?.name === c.name;
        if (isSelected) return '#ffffff';
        if (!c.is_physical) return '#7f1d1d';
        return '#16a34a';
      })
      .attr('stroke-width', (d: any) => (selectedNode?.name === d.data.name ? 2 : 1))
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: any) => {
        if (d.data.component) {
          setHoveredNode({
            targetItem: d.data.component,
            x: event.clientX,
            y: event.clientY
          });
        }
      })
      .on('mouseleave', () => setHoveredNode(null))
      .on('click', (_, d: any) => {
        if (d.data.component) {
          setSelectedNode(d.data.component);
        }
      });

    // Intelligent Text: Render strictly inside clip path without overflow
    leafNodes.each(function(d: any, i: number) {
      const boxW = d.x1 - d.x0;
      const boxH = d.y1 - d.y0;

      // Only render text if box is large enough
      if (boxW >= 55 && boxH >= 24) {
        const g = d3.select(this);
        const clipId = `clip-lib-${i}`;

        g.append('text')
          .attr('x', 6)
          .attr('y', 14)
          .attr('clip-path', `url(#${clipId})`)
          .text(d.data.name)
          .attr('font-size', boxW < 90 ? '9px' : '10px')
          .attr('font-weight', '600')
          .attr('fill', '#ffffff')
          .style('pointer-events', 'none');

        if (boxH >= 38) {
          g.append('text')
            .attr('x', 6)
            .attr('y', 28)
            .attr('clip-path', `url(#${clipId})`)
            .text(`${d.data.exportsCount} exports`)
            .attr('font-size', '8px')
            .attr('fill', '#bbf7d0')
            .style('pointer-events', 'none');
        }
      }
    });

  }, [filteredLibraries, viewMode, selectedNode, zoomedSubsystem]);

  const physicalCount = data.libraries.filter(l => l.is_physical).length;
  const missingCount = data.libraries.filter(l => !l.is_physical).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* AnyPS5 Reference Header & Metrics Banner */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f24',
        borderRadius: '8px',
        padding: '18px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                backgroundColor: '#14532d',
                color: '#4ade80',
                border: '1px solid #16a34a',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                MODULE TAXONOMY
              </span>
              <span style={{ fontSize: '12px', color: '#71717a' }}>
                17 Authenticated Physical DLLs • 1 Missing Requirement
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
              Authentic Library & Subsystem Matrix
            </h2>
          </div>

          {/* AnyPS5 Style Stats Block */}
          <div style={{
            backgroundColor: '#121215',
            border: '1px solid #27272a',
            padding: '10px 18px',
            borderRadius: '6px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
              Target modules analyzed: <strong style={{ color: '#22c55e' }}>{physicalCount}</strong> physical / <strong style={{ color: '#f87171' }}>{missingCount}</strong> missing
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', fontFamily: 'monospace', marginTop: '2px' }}>
              6 Subsystem Domains Mapped
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, Subsystem Filter, View Mode Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #1f1f24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search library name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#141417',
                border: '1px solid #27272a',
                color: '#f4f4f5',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                minWidth: '220px'
              }}
            />

            <select
              value={subsystemFilter}
              onChange={e => { setSubsystemFilter(e.target.value); setZoomedSubsystem(null); }}
              style={{
                backgroundColor: '#141417',
                border: '1px solid #27272a',
                color: '#f4f4f5',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Subsystems ({availableSubsystems.length})</option>
              {availableSubsystems.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {zoomedSubsystem && (
              <button
                onClick={() => setZoomedSubsystem(null)}
                style={{
                  backgroundColor: '#2b070b',
                  border: '1px solid #7f1d1d',
                  color: '#f87171',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Reset Zoom ({zoomedSubsystem})
              </button>
            )}
          </div>

          {/* Mode Switcher: AnyPS5 Matrix vs Treemap */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#141417', padding: '3px', borderRadius: '4px', border: '1px solid #27272a' }}>
            <button
              onClick={() => setViewMode('matrix')}
              style={{
                backgroundColor: viewMode === 'matrix' ? '#15803d' : 'transparent',
                color: viewMode === 'matrix' ? '#ffffff' : '#a1a1aa',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              AnyPS5 Module Grid
            </button>
            <button
              onClick={() => setViewMode('treemap')}
              style={{
                backgroundColor: viewMode === 'treemap' ? '#15803d' : 'transparent',
                color: viewMode === 'treemap' ? '#ffffff' : '#a1a1aa',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Subsystem Treemap
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: AnyPS5 Module Matrix (Clean Grid of Green & Gray Module Cards) */}
      {viewMode === 'matrix' && (
        <div style={{
          backgroundColor: '#0a0a0c',
          border: '1px solid #1f1f24',
          borderRadius: '8px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          {filteredLibraries.map(lib => {
            const isPhysical = lib.is_physical;
            const isSelected = selectedNode?.name === lib.name;

            return (
              <div
                key={lib.name}
                onClick={() => setSelectedNode(lib)}
                style={{
                  backgroundColor: isSelected
                    ? '#166534'
                    : isPhysical
                      ? '#14532d'
                      : '#1c1917',
                  border: isSelected
                    ? '1.5px solid #4ade80'
                    : isPhysical
                      ? '1px solid #16a34a'
                      : '1px solid #7f1d1d',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'transform 0.1s ease, border-color 0.1s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(74, 222, 128, 0.4)' : 'none'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isPhysical ? '#ffffff' : '#fca5a5',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {lib.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                  <span style={{ color: isPhysical ? '#86efac' : '#f87171' }}>
                    {isPhysical ? `${lib.exports_count} exports` : 'Missing .exe'}
                  </span>
                  <span style={{ color: '#a1a1aa' }}>
                    {lib.subsystem?.split(' ')[0] || 'System'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: D3 Subsystem Treemap with Clamping & Sizing Fixes */}
      {viewMode === 'treemap' && (
        <div style={{
          backgroundColor: '#0a0a0c',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #1f1f24',
          position: 'relative'
        }}>
          <svg ref={svgRef} />
        </div>
      )}

      {/* Hover Floating Tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'fixed',
          left: Math.min(hoveredNode.x + 12, window.innerWidth - 240),
          top: hoveredNode.y + 12,
          backgroundColor: '#0a0a0c',
          border: '1px solid #22c55e',
          borderRadius: '4px',
          padding: '8px 12px',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace', fontSize: '12px' }}>
            {hoveredNode.targetItem.name}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>
            {hoveredNode.targetItem.subsystem} | {hoveredNode.targetItem.exports_count} exports
          </div>
        </div>
      )}

      {/* Selected Library Detail Card */}
      {selectedNode && (
        <div style={{
          backgroundColor: '#0a0a0c',
          borderRadius: '8px',
          padding: '18px 22px',
          border: '1px solid #16a34a',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                backgroundColor: selectedNode.is_physical ? '#14532d' : '#2b070b',
                color: selectedNode.is_physical ? '#4ade80' : '#f87171',
                border: `1px solid ${selectedNode.is_physical ? '#16a34a' : '#7f1d1d'}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {selectedNode.is_physical ? 'PHYSICAL DLL' : 'MISSING REQUIREMENT'}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f4f4f5', margin: 0, fontFamily: 'monospace' }}>
                {selectedNode.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#71717a' }}>Subsystem Domain:</span>
              <div style={{ fontWeight: 600, color: '#22c55e' }}>{selectedNode.subsystem}</div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Category:</span>
              <div style={{ fontWeight: 600, color: '#f4f4f5' }}>{selectedNode.category}</div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Exported Symbols:</span>
              <div style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                {selectedNode.exports_count.toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Resolution Status:</span>
              <div style={{ fontWeight: 600, color: selectedNode.is_physical ? '#4ade80' : '#f87171' }}>
                {selectedNode.status}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            {selectedNode.description}
          </p>
        </div>
      )}
    </div>
  );
};
