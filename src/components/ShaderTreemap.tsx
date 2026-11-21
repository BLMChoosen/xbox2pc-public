import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PublicShaderStatsData, PublicShaderMnemonic } from '../types';

interface ShaderTreemapProps {
  data: PublicShaderStatsData;
  filterFamily?: string;
}

export const ShaderTreemap: React.FC<ShaderTreemapProps> = ({ data, filterFamily }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInst, setSelectedInst] = useState<{ mnemonic: PublicShaderMnemonic; family: string } | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>(filterFamily || 'all');

  const availableFamilies = data.families.map(f => f.family).sort();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 900;
    const height = 500;

    let families = data.families;
    if (familyFilter && familyFilter !== 'all') {
      families = families.filter(f => f.family === familyFilter);
    }

    const hierarchyData = {
      name: 'All GPU Instructions',
      children: families.map(f => ({
        name: f.family,
        family: f.family,
        children: f.mnemonics.map(m => ({
          name: m.mnemonic,
          family: f.family,
          count: m.occurrences,
          value: m.occurrences,
          sample: m
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
      .paddingInner(2)(root as any);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .style('width', '100%')
       .style('height', 'auto')
       .style('font-family', 'sans-serif');

    const familyColors: Record<string, string> = {
      VOP2: '#e11d48',
      VOP3: '#be123c',
      VOP1: '#f43f5e',
      VOPC: '#fb7185',
      SOP1: '#dc2626',
      SOP2: '#b91c1c',
      SOPP: '#991b1b',
      SOPK: '#7f1d1d',
      SMEM: '#c2410c',
      MIMG: '#9f1239',
      MUBUF: '#881337',
      DS: '#ea580c',
      GLOBAL: '#4c0519',
      UNKNOWN: '#27272a'
    };

    const getColor = (d: any) => {
      if (d.depth === 1) return '#1a0507';
      const fam = d.data.family;
      return familyColors[fam] || '#520810';
    };

    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    nodes.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => getColor(d))
      .attr('stroke', '#050505')
      .attr('stroke-width', (d: any) => (d.depth === 1 ? 2 : 1))
      .attr('rx', (d: any) => (d.depth === 2 ? 3 : 2))
      .style('cursor', (d: any) => (d.depth === 2 ? 'pointer' : 'default'))
      .on('click', (_, d: any) => {
        if (d.depth === 2 && d.data.sample) {
          setSelectedInst({ mnemonic: d.data.sample, family: d.data.family });
        }
      });

    nodes.filter((d: any) => d.depth === 1)
      .append('text')
      .attr('x', 6)
      .attr('y', 15)
      .text((d: any) => `${d.data.name} (${d.children ? d.children.length : 0} mnemonics)`)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#a1a1aa');

    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 5)
      .attr('y', 14)
      .text((d: any) => {
        const boxW = d.x1 - d.x0;
        return boxW > 45 ? d.data.name : '';
      })
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#ffffff');

    nodes.filter((d: any) => d.depth === 2)
      .append('text')
      .attr('x', 5)
      .attr('y', 26)
      .text((d: any) => {
        const boxW = d.x1 - d.x0;
        return boxW > 55 ? `${d.data.count}` : '';
      })
      .attr('font-size', '9px')
      .attr('fill', '#fecaca');

  }, [data, familyFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            AMD RDNA2 (GFX10.3 / Scarlett) Shader Instruction Treemap
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Visualizes instruction occurrences decoded across BVH and Scarlett ACO shader containers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: '#a1a1aa' }}>Filter ISA Family:</label>
          <select
            value={familyFilter}
            onChange={e => setFamilyFilter(e.target.value)}
            style={{
              backgroundColor: '#121215',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px'
            }}>
            <option value="all">All Families ({data.families.length} families)</option>
            {availableFamilies.map(fam => (
              <option key={fam} value={fam}>{fam}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        padding: '16px',
        border: '1px solid #1f1f24'
      }}>
        <svg ref={svgRef} />
      </div>

      {selectedInst && (
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
              <code>{selectedInst.mnemonic.mnemonic}</code>
            </h3>
            <span style={{
              backgroundColor: '#2b070b',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Family: {selectedInst.family}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#71717a' }}>
            Format: <strong style={{ color: '#d4d4d8' }}>{selectedInst.mnemonic.format}</strong> | Decoded Occurrences: <strong style={{ color: '#ef4444' }}>{selectedInst.mnemonic.occurrences.toLocaleString()}</strong>
          </div>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0' }}>
            {selectedInst.mnemonic.description}
          </p>
        </div>
      )}
    </div>
  );
};
