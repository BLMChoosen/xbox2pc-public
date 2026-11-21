import React, { useEffect, useRef, useState } from 'react';
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

  const availableSubsystems = Array.from(new Set(
    data.libraries.map(c => c.subsystem || 'Other unidentified subsystems')
  )).sort();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 900;
    const height = 500;

    let libraries = data.libraries;
    if (subsystemFilter && subsystemFilter !== 'all') {
      libraries = libraries.filter(c => c.subsystem === subsystemFilter);
    }

    // Build hierarchical data: Root -> Subsystem -> Library
    const subsystemMap: Record<string, PublicLibraryItem[]> = {};
    libraries.forEach(lib => {
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
          value: Math.max(lib.exports_count, 5),
          component: lib
        }))
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<any>()
      .size([width, height])
      .paddingTop(22)
      .paddingRight(3)
      .paddingBottom(3)
      .paddingLeft(3)
      .paddingInner(3)(root as any);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .style('width', '100%')
       .style('height', 'auto')
       .style('font-family', 'sans-serif');

    const getColor = (d: any) => {
      if (d.data.component) {
        const c: PublicLibraryItem = d.data.component;
        if (c.name.endsWith('.exe')) return '#ff2a4b'; // Target Exe
        if (!c.is_physical) return '#b91c1c'; // Missing platform library
        if (c.status === 'Implemented') return '#ef4444';
        if (c.status === 'Stub') return '#9a3412';
        return '#520810'; // Analyzed Physical DLL
      }
      return '#1a0507'; // Subsystem parent header
    };

    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Render rectangles
    nodes.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => getColor(d))
      .attr('stroke', '#050505')
      .attr('stroke-width', (d: any) => (d.depth === 1 ? 2 : 1))
      .attr('rx', (d: any) => (d.depth === 2 ? 4 : 2))
      .style('cursor', (d: any) => (d.depth === 2 ? 'pointer' : 'default'))
      .on('click', (_, d: any) => {
        if (d.data.component) {
          setSelectedNode(d.data.component);
        }
      });

    // Subsystem Header Text (Depth 1)
    nodes.filter((d: any) => d.depth === 1)
      .append('text')
      .attr('x', 6)
      .attr('y', 15)
      .text((d: any) => `${d.data.name} (${d.children ? d.children.length : 0})`)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#a1a1aa');

    // Library Label (Depth 2)
    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 6)
      .attr('y', 16)
      .text((d: any) => {
        const boxW = d.x1 - d.x0;
        const name = d.data.name;
        if (boxW < 40) return '';
        if (boxW < 80 && name.length > 8) return name.slice(0, 6) + '…';
        return name;
      })
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#f4f4f5')
      .style('pointer-events', 'none');

    // Symbol Count Sub-label (Depth 2)
    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 6)
      .attr('y', 30)
      .text((d: any) => {
        const boxH = d.y1 - d.y0;
        const boxW = d.x1 - d.x0;
        if (boxH < 38 || boxW < 50) return '';
        const exp = d.data.exportsCount;
        return exp > 0 ? `${exp} sym` : '0 sym';
      })
      .attr('font-size', '10px')
      .attr('fill', '#fca5a5')
      .style('pointer-events', 'none');

  }, [data, subsystemFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
          System Library Architecture Treemap ({data.libraries.length} Libraries)
        </h2>
        <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
          Visual volume mapping of discovered physical DLLs, target executables, and platform interfaces.
        </p>
      </div>

      {/* Filter and Legend Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: '#a1a1aa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Filter Subsystem:</span>
          <select
            value={subsystemFilter}
            onChange={e => setSubsystemFilter(e.target.value)}
            style={{
              backgroundColor: '#121215',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px'
            }}>
            <option value="all">All Subsystems ({data.libraries.length} libs)</option>
            {availableSubsystems.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Treemap Color Legend */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#520810', borderRadius: '3px' }}></span>
            Analyzed Physical DLL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#b91c1c', borderRadius: '3px' }}></span>
            Missing Platform Requirement
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#ff2a4b', borderRadius: '3px' }}></span>
            Target Executable
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        padding: '16px',
        border: '1px solid #1f1f24'
      }}>
        <svg ref={svgRef} />
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div style={{
          backgroundColor: '#0a0a0c',
          borderRadius: '6px',
          padding: '16px 20px',
          border: '1px solid #1f1f24',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
              {selectedNode.name}
            </h3>
            <span style={{
              backgroundColor: selectedNode.is_physical ? '#160406' : '#2b070b',
              color: selectedNode.is_physical ? '#fca5a5' : '#f87171',
              border: selectedNode.is_physical ? '1px solid #520810' : '1px solid #7f1d1d',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {selectedNode.status}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#71717a' }}>
            Subsystem: <strong style={{ color: '#d4d4d8' }}>{selectedNode.subsystem}</strong> | Category: <strong style={{ color: '#d4d4d8' }}>{selectedNode.category}</strong>
          </div>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0' }}>
            {selectedNode.description}
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#71717a' }}>
            <span>Exported Symbols: <strong style={{ color: '#ef4444' }}>{selectedNode.exports_count.toLocaleString()}</strong></span>
            <span>Import Dependencies: <strong style={{ color: '#ef4444' }}>{selectedNode.imports_count.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
