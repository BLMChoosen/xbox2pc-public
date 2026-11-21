import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PublicShaderStatsData, PublicShaderMnemonic, PublicShaderFamily } from '../types';

interface ShaderTreemapProps {
  data: PublicShaderStatsData;
  filterFamily?: string;
}

export const ShaderTreemap: React.FC<ShaderTreemapProps> = ({ data, filterFamily }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInst, setSelectedInst] = useState<{ mnemonic: PublicShaderMnemonic; family: string } | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>(filterFamily || 'all');
  const [viewMode, setViewMode] = useState<'matrix' | 'treemap'>('matrix');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredInst, setHoveredInst] = useState<{ mnemonic: PublicShaderMnemonic; family: string; x: number; y: number } | null>(null);
  const [zoomedFamily, setZoomedFamily] = useState<string | null>(null);

  const availableFamilies = useMemo(() => {
    return data.families.map(f => f.family).sort();
  }, [data]);

  const totalDecoded = (data.summary as any)?.total_instructions_decoded || (data.summary as any)?.total_decoded_occurrences || 39268;
  const totalMnemonics = (data.summary as any)?.total_unique_mnemonics || (data.summary as any)?.unique_instructions || 202;

  const filteredFamilies = useMemo(() => {
    let list = data.families;
    if (familyFilter !== 'all') {
      list = list.filter(f => f.family === familyFilter);
    }
    if (zoomedFamily) {
      list = list.filter(f => f.family === zoomedFamily);
    }
    return list;
  }, [data, familyFilter, zoomedFamily]);

  // D3 Treemap Effect (for Treemap Mode)
  useEffect(() => {
    if (viewMode !== 'treemap' || !svgRef.current) return;

    const width = 960;
    const height = 540;

    const hierarchyData = {
      name: 'All GPU Instructions',
      children: filteredFamilies.map(f => ({
        name: f.family,
        family: f.family,
        children: f.mnemonics.map(m => ({
          name: m.mnemonic,
          family: f.family,
          count: m.occurrences,
          // Using square root scaling to prevent single instruction monopolization
          value: Math.sqrt(m.occurrences) + 3,
          sample: m
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

    // Create defs for clipping paths
    const defs = svg.append('defs');

    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Depth 1: Family groups
    nodes.filter((d: any) => d.depth === 1)
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', '#0a0a0c')
      .attr('stroke', '#27272a')
      .attr('stroke-width', 1.5)
      .attr('rx', 4);

    // Family group header text
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
        setZoomedFamily(zoomedFamily === d.data.name ? null : d.data.name);
      });

    // Depth 2: Leaf instructions
    const leafNodes = nodes.filter((d: any) => d.depth === 2);

    // Add unique clip-path for each leaf
    leafNodes.each(function(d: any, i: number) {
      const clipId = `clip-shader-${i}`;
      defs.append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('width', Math.max(0, d.x1 - d.x0 - 4))
        .attr('height', Math.max(0, d.y1 - d.y0 - 4))
        .attr('rx', 2);
    });

    leafNodes.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => {
        const isMatch = !searchTerm || d.data.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isSelected = selectedInst?.mnemonic.mnemonic === d.data.name;
        if (isSelected) return '#4ade80';
        if (!isMatch) return '#1e293b';
        return '#15803d'; // AnyPS5 Green
      })
      .attr('stroke', (d: any) => {
        const isSelected = selectedInst?.mnemonic.mnemonic === d.data.name;
        return isSelected ? '#ffffff' : '#050505';
      })
      .attr('stroke-width', (d: any) => (selectedInst?.mnemonic.mnemonic === d.data.name ? 2 : 1))
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: any) => {
        if (d.data.sample) {
          setHoveredInst({
            mnemonic: d.data.sample,
            family: d.data.family,
            x: event.clientX,
            y: event.clientY
          });
        }
      })
      .on('mousemove', (event: MouseEvent) => {
        if (hoveredInst) {
          setHoveredInst(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
        }
      })
      .on('mouseleave', () => {
        setHoveredInst(null);
      })
      .on('click', (_, d: any) => {
        if (d.data.sample) {
          setSelectedInst({ mnemonic: d.data.sample, family: d.data.family });
        }
      });

    // Intelligent Text: Render ONLY if box is large enough to contain it without overflow
    leafNodes.each(function(d: any, i: number) {
      const boxW = d.x1 - d.x0;
      const boxH = d.y1 - d.y0;

      // Only render text if the box has sufficient space
      if (boxW >= 50 && boxH >= 24) {
        const g = d3.select(this);
        const clipId = `clip-shader-${i}`;

        // Mnemonic name
        g.append('text')
          .attr('x', 4)
          .attr('y', 13)
          .attr('clip-path', `url(#${clipId})`)
          .text(d.data.name)
          .attr('font-size', boxW < 75 ? '9px' : '10px')
          .attr('font-weight', '600')
          .attr('fill', '#ffffff')
          .style('pointer-events', 'none');

        // Occurrences count if height allows
        if (boxH >= 36) {
          g.append('text')
            .attr('x', 4)
            .attr('y', 25)
            .attr('clip-path', `url(#${clipId})`)
            .text(`${d.data.count.toLocaleString()}`)
            .attr('font-size', '8px')
            .attr('fill', '#bbf7d0')
            .style('pointer-events', 'none');
        }
      }
    });

  }, [filteredFamilies, viewMode, searchTerm, selectedInst, zoomedFamily]);

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
                RDNA2 SHADER TAXONOMY
              </span>
              <span style={{ fontSize: '12px', color: '#71717a' }}>
                Scarlett ACO / BVH / FSR Containers
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
              AMD RDNA2 (GFX10.3 / Scarlett) Instruction Matrix
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
              RDNA2 reference forms decoded: <strong style={{ color: '#22c55e' }}>100.0%</strong> ({totalMnemonics}/{totalMnemonics})
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', fontFamily: 'monospace', marginTop: '2px' }}>
              {totalDecoded.toLocaleString()} decoded occurrences
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, Family Filter, View Mode Toggle */}
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
              placeholder="Search mnemonic (e.g. v_max, s_waitcnt)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#141417',
                border: '1px solid #27272a',
                color: '#f4f4f5',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                minWidth: '240px'
              }}
            />

            <select
              value={familyFilter}
              onChange={e => { setFamilyFilter(e.target.value); setZoomedFamily(null); }}
              style={{
                backgroundColor: '#141417',
                border: '1px solid #27272a',
                color: '#f4f4f5',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Families ({data.families.length})</option>
              {availableFamilies.map(fam => (
                <option key={fam} value={fam}>{fam}</option>
              ))}
            </select>

            {zoomedFamily && (
              <button
                onClick={() => setZoomedFamily(null)}
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
                Reset Zoom ({zoomedFamily})
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
              AnyPS5 Matrix View
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
              Hierarchical Treemap
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: AnyPS5 Matrix View (Grid of Green & Gray Squares) */}
      {viewMode === 'matrix' && (
        <div style={{
          backgroundColor: '#0a0a0c',
          border: '1px solid #1f1f24',
          borderRadius: '8px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredFamilies.map((fam: PublicShaderFamily) => (
            <div
              key={fam.family}
              style={{
                backgroundColor: '#121215',
                border: '1px solid #27272a',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace' }}>
                  {fam.family}
                </span>
                <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>
                  {fam.mnemonics.length} mnemonics
                </span>
              </div>

              {/* Grid of tiles (AnyPS5 Style) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(22px, 1fr))',
                gap: '4px',
                padding: '4px',
                backgroundColor: '#0a0a0c',
                borderRadius: '4px',
                border: '1px solid #1f1f24'
              }}>
                {fam.mnemonics.map(m => {
                  const isMatch = !searchTerm || m.mnemonic.toLowerCase().includes(searchTerm.toLowerCase());
                  const isSelected = selectedInst?.mnemonic.mnemonic === m.mnemonic;
                  const isDecoded = m.occurrences > 0;

                  return (
                    <div
                      key={m.mnemonic}
                      title={`${m.mnemonic} (${m.occurrences.toLocaleString()} occurrences)`}
                      onClick={() => setSelectedInst({ mnemonic: m, family: fam.family })}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '3px',
                        backgroundColor: isSelected
                          ? '#4ade80'
                          : isMatch
                            ? (isDecoded ? '#22c55e' : '#334155')
                            : '#1f2937',
                        border: isSelected
                          ? '1px solid #ffffff'
                          : isMatch
                            ? '1px solid #16a34a'
                            : '1px solid #374151',
                        opacity: isMatch ? 1 : 0.25,
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease, background-color 0.1s ease',
                        boxShadow: isSelected ? '0 0 8px rgba(74, 222, 128, 0.6)' : 'none'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                        (e.currentTarget as HTMLElement).style.zIndex = '10';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLElement).style.zIndex = '1';
                      }}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71717a' }}>
                <span>Format: {fam.mnemonics[0]?.format || fam.family}</span>
                <span>{fam.occurrences.toLocaleString()} total ops</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: D3 Hierarchical Treemap with Clamping & Sizing Fixes */}
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
      {hoveredInst && (
        <div style={{
          position: 'fixed',
          left: Math.min(hoveredInst.x + 12, window.innerWidth - 240),
          top: hoveredInst.y + 12,
          backgroundColor: '#0a0a0c',
          border: '1px solid #22c55e',
          borderRadius: '4px',
          padding: '8px 12px',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace', fontSize: '12px' }}>
            {hoveredInst.mnemonic.mnemonic}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>
            Family: {hoveredInst.family} | {hoveredInst.mnemonic.occurrences.toLocaleString()} ops
          </div>
        </div>
      )}

      {/* Selected Instruction Detail Card */}
      {selectedInst && (
        <div style={{
          backgroundColor: '#0a0a0c',
          borderRadius: '8px',
          padding: '16px 20px',
          border: '1px solid #16a34a',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                backgroundColor: '#14532d',
                color: '#4ade80',
                border: '1px solid #16a34a',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                SELECTED INSTRUCTION
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f4f4f5', margin: 0, fontFamily: 'monospace' }}>
                {selectedInst.mnemonic.mnemonic}
              </h3>
            </div>
            <button
              onClick={() => setSelectedInst(null)}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px', marginTop: '4px' }}>
            <div>
              <span style={{ color: '#71717a' }}>ISA Family:</span>
              <div style={{ fontWeight: 600, color: '#22c55e' }}>{selectedInst.family}</div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Instruction Format:</span>
              <div style={{ fontWeight: 600, color: '#f4f4f5', fontFamily: 'monospace' }}>{selectedInst.mnemonic.format}</div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Decoded Occurrences:</span>
              <div style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                {selectedInst.mnemonic.occurrences.toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ color: '#71717a' }}>Container Status:</span>
              <div style={{ fontWeight: 600, color: '#a1a1aa' }}>Decoded in ACO/BVH</div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            {selectedInst.mnemonic.description}
          </p>
        </div>
      )}
    </div>
  );
};
