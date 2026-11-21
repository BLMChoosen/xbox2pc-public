import React, { useState, useMemo } from 'react';
import { PublicImplementationStatsData, PublicImplementationRecord } from '../types';

interface ImplementationViewProps {
  data: PublicImplementationStatsData;
}

export const ImplementationView: React.FC<ImplementationViewProps> = ({ data }) => {
  const { summary, implementations } = data;

  const [search, setSearch] = useState<string>('');
  const [selectedImplStatus, setSelectedImplStatus] = useState<string>('all');
  const [selectedTestStatus, setSelectedTestStatus] = useState<string>('all');
  const [selectedValStatus, setSelectedValStatus] = useState<string>('all');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [onlyNotValidated, setOnlyNotValidated] = useState<boolean>(false);
  const [onlyFlagged, setOnlyFlagged] = useState<boolean>(false);
  const [onlyStubs, setOnlyStubs] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<PublicImplementationRecord | null>(null);

  const [page, setPage] = useState<number>(0);
  const pageSize = 50;

  const subsystems = useMemo(() => {
    return Array.from(new Set(implementations.map(i => i.subsystem))).sort();
  }, [implementations]);

  const filtered = useMemo(() => {
    return implementations.filter(item => {
      if (selectedImplStatus !== 'all' && item.implementation_status !== selectedImplStatus) return false;
      if (selectedTestStatus !== 'all' && item.testing_status !== selectedTestStatus) return false;
      if (selectedValStatus !== 'all' && item.validation_status !== selectedValStatus) return false;
      if (selectedSubsystem !== 'all' && item.subsystem !== selectedSubsystem) return false;
      if (onlyNotValidated && (item.implementation_status !== 'Implemented' || item.validation_status === 'Behaviorally validated')) return false;
      if (onlyFlagged && !item.flagged_for_review) return false;
      if (onlyStubs && !item.is_stub) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.component_id.toLowerCase().includes(q) &&
          !item.source_file_ref.toLowerCase().includes(q) &&
          !(item.developer_notes || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [implementations, search, selectedImplStatus, selectedTestStatus, selectedValStatus, selectedSubsystem, onlyNotValidated, onlyFlagged, onlyStubs]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const displayed = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
          Implementation, Testing & Behavioral Validation Tracking
        </h2>
        <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
          Lifecycle tracking across discovered symbols, functional implementation, automated testing, and behavioral validation.
        </p>
      </div>

      {/* Primary Verification Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Discovered Universe</span>
          <span style={kpiVal}>{summary.total_discovered.toLocaleString()}</span>
          <span style={kpiSub}>Cataloged components</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Game-Required Targets</span>
          <span style={{ ...kpiVal, color: '#ef4444' }}>{summary.game_required}</span>
          <span style={kpiSub}>Missing platform dependencies</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Implemented Components</span>
          <span style={{ ...kpiVal, color: '#f87171' }}>{summary.implemented}</span>
          <span style={kpiSub}>Functional runtime code</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Detected Stubs</span>
          <span style={{ ...kpiVal, color: '#dc2626' }}>{summary.stubs}</span>
          <span style={kpiSub}>Excluded from progress</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Tested Components</span>
          <span style={{ ...kpiVal, color: '#fca5a5' }}>{summary.tested}</span>
          <span style={kpiSub}>Passing automated tests</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Hardware Validated</span>
          <span style={{ ...kpiVal, color: '#b91c1c' }}>{summary.validated}</span>
          <span style={kpiSub}>Behavioral trace parity</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f24',
        borderRadius: '6px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search symbol name, component ID, file ref..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
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
            value={selectedSubsystem}
            onChange={e => { setSelectedSubsystem(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Subsystems</option>
            {subsystems.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedImplStatus}
            onChange={e => { setSelectedImplStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Impl States</option>
            <option value="Implemented">Implemented</option>
            <option value="Stub">Stub</option>
            <option value="Partial">Partial</option>
            <option value="Not implemented">Not implemented</option>
          </select>

          <select
            value={selectedTestStatus}
            onChange={e => { setSelectedTestStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Test States</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Running">Running</option>
            <option value="Not tested">Not tested</option>
          </select>

          <select
            value={selectedValStatus}
            onChange={e => { setSelectedValStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Validation States</option>
            <option value="Behaviorally validated">Behaviorally validated</option>
            <option value="Partially validated">Partially validated</option>
            <option value="Not validated">Not validated</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', color: '#a1a1aa' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyNotValidated}
              onChange={e => { setOnlyNotValidated(e.target.checked); setPage(0); }}
            />
            Implemented but Not Validated
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyFlagged}
              onChange={e => { setOnlyFlagged(e.target.checked); setPage(0); }}
            />
            Flagged for Review
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyStubs}
              onChange={e => { setOnlyStubs(e.target.checked); setPage(0); }}
            />
            Detected Stubs
          </label>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: '#0a0a0c',
        borderRadius: '6px',
        border: '1px solid #1f1f24',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#121215', borderBottom: '1px solid #1f1f24', color: '#71717a' }}>
              <th style={{ padding: '10px 14px' }}>Symbol / Component</th>
              <th style={{ padding: '10px 14px' }}>Subsystem</th>
              <th style={{ padding: '10px 14px' }}>Implementation</th>
              <th style={{ padding: '10px 14px' }}>Testing</th>
              <th style={{ padding: '10px 14px' }}>Validation</th>
              <th style={{ padding: '10px 14px' }}>Source Ref</th>
              <th style={{ padding: '10px 14px' }}>Commit</th>
              <th style={{ padding: '10px 14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#71717a' }}>
                  No implementation records match the current filters.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.component_id} style={{
                  borderBottom: '1px solid #1f1f24',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#08080a'
                }}>
                  <td style={{ padding: '10px 14px', color: '#f4f4f5', fontWeight: 600, fontFamily: 'monospace' }}>
                    {item.name}
                    {item.flagged_for_review && (
                      <span style={{ marginLeft: '6px', color: '#f87171', fontSize: '11px', fontWeight: 700 }}>
                        [Review]
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#a1a1aa' }}>
                    {item.subsystem}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={statusBadgeStyle(item.implementation_status)}>
                      {item.implementation_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={testingBadgeStyle(item.testing_status)}>
                      {item.testing_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={valBadgeStyle(item.validation_status)}>
                      {item.validation_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#ef4444', fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.source_file_ref}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#71717a', fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.git_commit_ref || 'None'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => setSelectedRecord(item)}
                      style={{
                        backgroundColor: '#121215',
                        border: '1px solid #27272a',
                        color: '#f87171',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}>
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#71717a' }}>
        <span>
          Showing {displayed.length > 0 ? page * pageSize + 1 : 0} - {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
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

      {/* Detailed Modal/Drawer */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 5, 5, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0a0a0c',
            border: '1px solid #1f1f24',
            borderRadius: '6px',
            maxWidth: '650px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f4f4f5', margin: 0, fontFamily: 'monospace' }}>
                  {selectedRecord.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                  ID: {selectedRecord.component_id}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={statusBadgeStyle(selectedRecord.implementation_status)}>
                Impl: {selectedRecord.implementation_status}
              </span>
              <span style={testingBadgeStyle(selectedRecord.testing_status)}>
                Test: {selectedRecord.testing_status}
              </span>
              <span style={valBadgeStyle(selectedRecord.validation_status)}>
                Val: {selectedRecord.validation_status}
              </span>
              {selectedRecord.flagged_for_review && (
                <span style={{ backgroundColor: '#2b070b', color: '#f87171', border: '1px solid #7f1d1d', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  Flagged: {selectedRecord.review_reason}
                </span>
              )}
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Subsystem & Category:</span>
              <span style={detailValStyle}>{selectedRecord.subsystem} ({selectedRecord.category})</span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Source File Reference:</span>
              <span style={{ ...detailValStyle, color: '#ef4444', fontFamily: 'monospace' }}>
                {selectedRecord.source_file_ref}
              </span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Verified Git Commit SHA:</span>
              <span style={{ ...detailValStyle, fontFamily: 'monospace' }}>
                {selectedRecord.git_commit_ref || 'Local uncommitted verification'}
              </span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Implemented At:</span>
              <span style={detailValStyle}>
                {new Date(selectedRecord.implemented_at).toLocaleString()}
              </span>
            </div>

            <div>
              <span style={detailLabelStyle}>Developer Notes & Justification:</span>
              <p style={{ backgroundColor: '#121215', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0', border: '1px solid #1f1f24' }}>
                {selectedRecord.developer_notes || 'No developer notes provided.'}
              </p>
            </div>

            <div>
              <span style={detailLabelStyle}>Associated Tests:</span>
              <div style={{ backgroundColor: '#121215', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #1f1f24' }}>
                <div><strong>Summary:</strong> {selectedRecord.test_summary}</div>
                {selectedRecord.test_identifiers.map(t => (
                  <div key={t} style={{ fontFamily: 'monospace', color: '#ef4444' }}>• {t}</div>
                ))}
              </div>
            </div>

            <div>
              <span style={detailLabelStyle}>Behavioral Hardware Parity Evidence:</span>
              <p style={{ backgroundColor: '#121215', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', color: selectedRecord.validation_evidence ? '#f87171' : '#71717a', margin: '4px 0 0 0', border: '1px solid #1f1f24' }}>
                {selectedRecord.validation_evidence || 'No behavioral hardware traces recorded. Validation remains Not validated.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  border: '1px solid #1f1f24',
  borderRadius: '6px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
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

const kpiSub: React.CSSProperties = {
  fontSize: '10px',
  color: '#52525b'
};

const selectStyle: React.CSSProperties = {
  backgroundColor: '#121215',
  border: '1px solid #27272a',
  color: '#f4f4f5',
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '13px',
  minWidth: '160px'
};

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
  backgroundColor: disabled ? '#121215' : '#2b070b',
  color: disabled ? '#52525b' : '#f87171',
  border: disabled ? '1px solid #1f1f24' : '1px solid #7f1d1d',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer'
});

const statusBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Implemented') return { backgroundColor: '#160406', color: '#fca5a5', border: '1px solid #520810', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Stub') return { backgroundColor: '#26080b', color: '#f87171', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Partial') return { backgroundColor: '#1f0709', color: '#f87171', border: '1px solid #520810', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#121215', color: '#71717a', border: '1px solid #27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
};

const testingBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Passed' || status === 'Tests passed') return { backgroundColor: '#160406', color: '#fca5a5', border: '1px solid #520810', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Failed' || status === 'Tests failed') return { backgroundColor: '#3b080d', color: '#f87171', border: '1px solid #991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Running' || status === 'Tests running') return { backgroundColor: '#1a0507', color: '#ef4444', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#121215', color: '#71717a', border: '1px solid #27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
};

const valBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Behaviorally validated') return { backgroundColor: '#2b070b', color: '#f87171', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Partially validated') return { backgroundColor: '#1a0507', color: '#ef4444', border: '1px solid #7f1d1d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#121215', color: '#71717a', border: '1px solid #27272a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  borderBottom: '1px solid #1f1f24',
  paddingBottom: '8px'
};

const detailLabelStyle: React.CSSProperties = {
  color: '#71717a',
  fontWeight: 600
};

const detailValStyle: React.CSSProperties = {
  color: '#f4f4f5'
};
