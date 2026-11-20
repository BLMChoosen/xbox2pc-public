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
        if (c.name.endsWith('.exe')) return '#ea580c'; // Target Exe
        if (!c.is_physical) return '#dc2626'; // Missing platform library
        if (c.status === 'Implemented') return '#16a34a';
        if (c.status === 'Stub') return '#ca8a04';
        return '#2563eb'; // Analyzed Physical DLL
      }
      return '#334155'; // Subsystem parent header
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
      .attr('stroke', '#0f172a')
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
      .attr('fill', '#94a3b8');

    // Library Label (Depth 2)
    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 6)
      .attr('y', 16)
      .text((d: any) => {
        const boxW = d.x1 - d.x0;
        return boxW > 60 ? d.data.name : '';
      })
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#f8fafc');

    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 6)
      .attr('y', 30)
      .text((d: any) => {
        const boxW = d.x1 - d.x0;
        return boxW > 70 ? `${d.data.exportsCount} exports` : '';
      })
      .attr('font-size', '10px')
      .attr('fill', '#cbd5e1');

  }, [data, subsystemFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            Xbox Platform & Middleware System Libraries Treemap
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Visualizes system subsystems and logical libraries. Sized by exported symbol counts.
          </p>
        </div>

        {/* Filter Subsystems */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8' }}>Filter Subsystem:</label>
          <select
            value={subsystemFilter}
            onChange={e => setSubsystemFilter(e.target.value)}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
            <option value="all">All Subsystems ({data.libraries.length} libs)</option>
            {availableSubsystems.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#cbd5e1', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '3px' }}></span>
          Discovered Physical DLL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '3px' }}></span>
          Missing Platform Requirement
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '3px' }}></span>
          Target Executable
        </div>
      </div>

      {/* SVG Container */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '16px',
        border: '1px solid #1e293b'
      }}>
        <svg ref={svgRef} />
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          padding: '16px 20px',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              {selectedNode.name}
            </h3>
            <span style={{
              backgroundColor: selectedNode.is_physical ? '#064e3b' : '#450a0a',
              color: selectedNode.is_physical ? '#6ee7b7' : '#fca5a5',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {selectedNode.status}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Subsystem: <strong style={{ color: '#e2e8f0' }}>{selectedNode.subsystem}</strong> • Category: <strong style={{ color: '#e2e8f0' }}>{selectedNode.category}</strong>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0' }}>
            {selectedNode.description}
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#94a3b8' }}>
            <span>Exported Symbols: <strong style={{ color: '#38bdf8' }}>{selectedNode.exports_count.toLocaleString()}</strong></span>
            <span>Import Dependencies: <strong style={{ color: '#38bdf8' }}>{selectedNode.imports_count.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
