import React, { useState, useMemo } from 'react';
import { PublicCatalogData, PublicCatalogItem } from '../types';

interface PublicCatalogTableProps {
  data: PublicCatalogData;
}

export const PublicCatalogTable: React.FC<PublicCatalogTableProps> = ({ data }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const pageSize = 50;

  const filteredItems = useMemo(() => {
    return data.items.filter(item => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedSubsystem !== 'all' && item.subsystem !== selectedSubsystem) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.id.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [data.items, search, selectedType, selectedSubsystem]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const displayed = filteredItems.slice(page * pageSize, (page + 1) * pageSize);

  const subsystems = useMemo(() => {
    return Array.from(new Set(data.items.map(i => i.subsystem))).sort();
  }, [data.items]);

  const types = useMemo(() => {
    return Array.from(new Set(data.items.map(i => i.type))).sort();
  }, [data.items]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
          Approved Public Architecture & ISA Catalog ({filteredItems.length.toLocaleString()} items)
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Audited public index of discovered system libraries, decoded AMD RDNA2 GPU instructions, and Microsoft GDK platform references.
        </p>
      </div>

      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#1e293b',
        padding: '14px 16px',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Search catalog by name, identifier, or description..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            flexGrow: 1,
            minWidth: '240px'
          }}
        />

        <select
          value={selectedType}
          onChange={e => { setSelectedType(e.target.value); setPage(0); }}
          style={selectStyle}>
          <option value="all">All Component Types</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedSubsystem}
          onChange={e => { setSelectedSubsystem(e.target.value); setPage(0); }}
          style={selectStyle}>
          <option value="all">All Subsystems</option>
          {subsystems.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '10px 14px' }}>Name / Identifier</th>
              <th style={{ padding: '10px 14px' }}>Type</th>
              <th style={{ padding: '10px 14px' }}>Subsystem / Category</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No matching approved public components found.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.id} style={{
                  borderBottom: '1px solid #1e293b',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#090e1a'
                }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#f8fafc', fontWeight: 600 }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#38bdf8' }}>
                    {item.type}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>
                    {item.subsystem}
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      backgroundColor: item.status.includes('Missing') ? '#450a0a' : '#064e3b',
                      color: item.status.includes('Missing') ? '#fca5a5' : '#6ee7b7',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '12px' }}>
                    {item.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8' }}>
        <span>
          Showing {displayed.length > 0 ? page * pageSize + 1 : 0} - {Math.min((page + 1) * pageSize, filteredItems.length)} of {filteredItems.length}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={pageBtnStyle(page === 0)}>
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={pageBtnStyle(page >= totalPages - 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  minWidth: '180px'
};

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
  backgroundColor: disabled ? '#1e293b' : '#0284c7',
  color: disabled ? '#64748b' : '#f8fafc',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer'
});
