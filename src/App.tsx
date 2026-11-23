import React, { useEffect, useState } from 'react';

import {
  PublicOverviewData,
  PublicCoverageData,
  PublicLibraryStatsData,
  PublicShaderStatsData,
  PublicDependencyStatsData,
  PublicSnapshotIndexData,
  PublicCatalogData,
  PublicImplementationStatsData,
  PublicAuditStatusData,
} from './types';

import { Overview } from './components/Overview';
import { LibraryTreemap } from './components/LibraryTreemap';
import { ShaderTreemap } from './components/ShaderTreemap';
import { DependencyGraphView } from './components/DependencyGraphView';
import { HistoricalView } from './components/HistoricalView';
import { PublicCatalogTable } from './components/PublicCatalogTable';
import { ImplementationView } from './components/ImplementationView';
import { TransparencyView } from './components/TransparencyView';

interface PublicData {
  overview: PublicOverviewData;
  coverage: PublicCoverageData;
  libraryStats: PublicLibraryStatsData;
  shaderStats: PublicShaderStatsData;
  dependencyStats: PublicDependencyStatsData;
  snapshotsIndex: PublicSnapshotIndexData;
  catalog: PublicCatalogData;
  implementationStats: PublicImplementationStatsData;
  auditStatus: PublicAuditStatusData;
}

const dataUrl = (path: string) => new URL(`data/${path}`, document.baseURI).toString();

async function loadPublicData(): Promise<PublicData> {
  const paths = [
    'overview.json', 'coverage.json', 'library_stats.json', 'shader_stats.json',
    'dependency_stats.json', 'snapshots/index.json', 'catalog.json',
    'implementation_stats.json', 'audit_status.json'
  ];
  const responses = await Promise.all(paths.map(async path => {
    const response = await fetch(dataUrl(path), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load approved public data: ${path}`);
    return response.json();
  }));
  const [overview, coverage, libraryStats, shaderStats, dependencyStats, snapshotsIndex, catalog, implementationStats, auditStatus] = responses;
  return { overview, coverage, libraryStats, shaderStats, dependencyStats, snapshotsIndex, catalog, implementationStats, auditStatus } as PublicData;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'libs' | 'shaders' | 'deps' | 'history' | 'catalog' | 'impl' | 'transparency'
  >('overview');
  const [data, setData] = useState<PublicData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicData().then(setData).catch(error => setLoadError(error instanceof Error ? error.message : 'Could not load approved public data.'));
  }, []);

  if (loadError) return <main role="alert" style={{ padding: '2rem', color: '#fca5a5', backgroundColor: '#050505', minHeight: '100vh' }}>{loadError}</main>;
  if (!data) return <main aria-busy="true" style={{ padding: '2rem', color: '#a1a1aa', backgroundColor: '#050505', minHeight: '100vh' }}>Loading approved public snapshot…</main>;
  const { overview, coverage, libraryStats, shaderStats, dependencyStats, snapshotsIndex, catalog, implementationStats, auditStatus } = data;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#050505', color: '#f4f4f5' }}>
      {/* Top Navbar */}
      <header style={{
        backgroundColor: '#0a0a0c',
        borderBottom: '1px solid #1f1f24',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/Logo.png"
            alt="Blood Moon Logo"
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '6px',
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.35))'
            }}
          />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f4f4f5', margin: 0 }}>
              Xbox2PC: Discovery & Compatibility Dashboard
            </h1>
            <div style={{ fontSize: '12px', color: '#71717a' }}>
              Target: Xbox Series X|S (Scarlett) | AMD Zen 2 (x86-64) | AMD RDNA2 (GFX10.3)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#a1a1aa' }}>
          <span style={{ backgroundColor: '#121215', border: '1px solid #27272a', padding: '6px 12px', borderRadius: '4px', fontFamily: 'monospace', color: '#d4d4d8' }}>
            Snapshot: {overview.public_snapshot_id}
          </span>
          <span style={{
            backgroundColor: 'rgba(6, 78, 59, 0.4)',
            color: '#34d399',
            border: '1px solid #059669',
            padding: '4px 10px',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.04em'
          }}>
            Runtime Active: M0–M9 Complete | M10 Active (Presentation Loop)
          </span>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <nav style={{
        backgroundColor: '#0a0a0c',
        borderBottom: '1px solid #1f1f24',
        padding: '0 28px',
        display: 'flex',
        gap: '20px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={tabButtonStyle(activeTab === 'overview')}>
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('libs')}
          style={tabButtonStyle(activeTab === 'libs')}>
          Library Treemap
        </button>
        <button
          onClick={() => setActiveTab('shaders')}
          style={tabButtonStyle(activeTab === 'shaders')}>
          Shader Treemap (RDNA2)
        </button>
        <button
          onClick={() => setActiveTab('deps')}
          style={tabButtonStyle(activeTab === 'deps')}>
          Dependency Graph
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={tabButtonStyle(activeTab === 'history')}>
          Historical Snapshots
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          style={tabButtonStyle(activeTab === 'catalog')}>
          API & ISA Catalog
        </button>
        <button
          onClick={() => setActiveTab('impl')}
          style={tabButtonStyle(activeTab === 'impl')}>
          Implementation Tracking
        </button>
        <button
          onClick={() => setActiveTab('transparency')}
          style={tabButtonStyle(activeTab === 'transparency')}>
          Data Transparency
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {activeTab === 'overview' && (
          <Overview
            overview={overview}
            coverage={coverage}
            libraryStats={libraryStats}
            shaderStats={shaderStats}
            auditStatus={auditStatus}
          />
        )}
        {activeTab === 'libs' && <LibraryTreemap data={libraryStats} />}
        {activeTab === 'shaders' && <ShaderTreemap data={shaderStats} />}
        {activeTab === 'deps' && <DependencyGraphView data={dependencyStats} />}
        {activeTab === 'history' && <HistoricalView data={snapshotsIndex} />}
        {activeTab === 'catalog' && <PublicCatalogTable data={catalog} />}
        {activeTab === 'impl' && <ImplementationView data={implementationStats} />}
        {activeTab === 'transparency' && <TransparencyView auditStatus={auditStatus} />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0a0a0c',
        borderTop: '1px solid #1f1f24',
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#71717a',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>
          Xbox2PC Research Dashboard | Generated {new Date(overview.generated_at).toLocaleDateString()}
        </div>
        <div>
          Clean-room engineering research for 64-bit Windows. Zero proprietary game binaries or copyrighted assets are published.
        </div>
      </footer>
    </div>
  );
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: isActive ? '2px solid #ef4444' : '2px solid transparent',
  color: isActive ? '#ef4444' : '#a1a1aa',
  fontWeight: isActive ? 600 : 500,
  fontSize: '13px',
  padding: '14px 4px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  outline: 'none',
  whiteSpace: 'nowrap'
});
