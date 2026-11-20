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
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Implementation, Testing & Behavioral Validation Tracking
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Audited lifecycle tracking. Strictly separates catalog discovery, functional implementation, automated testing, and behavioral validation.
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
          <span style={{ ...kpiVal, color: '#ea580c' }}>{summary.game_required}</span>
          <span style={kpiSub}>Missing platform dependencies</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Implemented Components</span>
          <span style={{ ...kpiVal, color: '#4ade80' }}>{summary.implemented}</span>
          <span style={kpiSub}>Functional (stubs excluded)</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Detected Stubs</span>
          <span style={{ ...kpiVal, color: '#ca8a04' }}>{summary.stubs}</span>
          <span style={kpiSub}>Excluded from progress</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Tested Components</span>
          <span style={{ ...kpiVal, color: '#38bdf8' }}>{summary.tested}</span>
          <span style={kpiSub}>Passing automated tests</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Behaviorally Validated</span>
          <span style={{ ...kpiVal, color: '#10b981' }}>{summary.validated}</span>
          <span style={kpiSub}>Hardware golden traces</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Implemented Not Validated</span>
          <span style={{ ...kpiVal, color: '#f59e0b' }}>{summary.implemented_not_validated}</span>
          <span style={kpiSub}>Code exists, parity pending</span>
        </div>

        <div style={kpiBoxStyle}>
          <span style={kpiLabel}>Flagged For Review</span>
          <span style={{ ...kpiVal, color: summary.flagged_for_review > 0 ? '#f87171' : '#64748b' }}>
            {summary.flagged_for_review}
          </span>
          <span style={kpiSub}>Git drift detected</span>
        </div>
      </div>

      {/* Discovery vs. Implementation Comparison Banner */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#38bdf8', margin: 0 }}>
            Catalog Discovery (99.97%) vs. Real Implementation (0.0%)
          </h3>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            Having a complete catalog of function signatures and opcode encodings does <strong>not</strong> mean the components are implemented. Stubs are permanently quarantined as <code>Stub</code> and never contribute to implementation percentages.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#10b981', margin: 0 }}>
            Unit Testing vs. Behavioral Validation
          </h3>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            A passing unit test confirms that code executes without crashing, but does <strong>not</strong> prove behavioral parity against Xbox Series X|S Scarlett hardware. Behavioral validation requires separate golden trace proof.
          </p>
        </div>
      </div>

      {/* 8 Distinct Lifecycle States Guide */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
          8 Distinct Audited Lifecycle States
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
          fontSize: '12px'
        }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 700 }}>1. Discovered</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Symbol/opcode identified in PE header or shader container.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>2. Analyzed</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Calling convention, parameters, and ISA format mapped.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>3. Specified</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Formal translation specification & requirements documented.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#ca8a04', fontWeight: 700 }}>4. Stub</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>No-op / placeholder shim. Permanently excluded from progress.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>5. Partially Implemented</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Subset of operations or paths functional; incomplete ABI.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>6. Implemented</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Complete non-stub translation logic reviewed in repository.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>7. Tested</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Automated unit test suite executes and passes in CI.</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>8. Behaviorally Validated</span>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '11px' }}>Verified against real Scarlett hardware golden traces.</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search component name, ID, source file, or notes..."
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
              minWidth: '220px'
            }}
          />

          <select
            value={selectedImplStatus}
            onChange={e => { setSelectedImplStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Implementation Statuses</option>
            <option value="Not implemented">Not implemented</option>
            <option value="Stub">Stub</option>
            <option value="Partial">Partial</option>
            <option value="Implemented">Implemented</option>
          </select>

          <select
            value={selectedTestStatus}
            onChange={e => { setSelectedTestStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Testing Statuses</option>
            <option value="Not tested">Not tested</option>
            <option value="Running">Running</option>
            <option value="Failed">Failed</option>
            <option value="Passed">Passed</option>
          </select>

          <select
            value={selectedValStatus}
            onChange={e => { setSelectedValStatus(e.target.value); setPage(0); }}
            style={selectStyle}>
            <option value="all">All Validation Statuses</option>
            <option value="Not validated">Not validated</option>
            <option value="Partially validated">Partially validated</option>
            <option value="Behaviorally validated">Behaviorally validated</option>
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

        {/* Quick Filter Checkboxes */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#cbd5e1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyNotValidated}
              onChange={e => { setOnlyNotValidated(e.target.checked); setPage(0); }}
            />
            Implemented But Not Validated
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyFlagged}
              onChange={e => { setOnlyFlagged(e.target.checked); setPage(0); }}
            />
            Flagged for Review (Git Drift)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyStubs}
              onChange={e => { setOnlyStubs(e.target.checked); setPage(0); }}
            />
            Detected Stubs Only
          </label>
        </div>
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
              <th style={{ padding: '10px 14px' }}>Component Name</th>
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
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No implementation records match the current filters.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.component_id} style={{
                  borderBottom: '1px solid #1e293b',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#090e1a'
                }}>
                  <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 600, fontFamily: 'monospace' }}>
                    {item.name}
                    {item.flagged_for_review && (
                      <span style={{ marginLeft: '6px', color: '#f87171', fontSize: '11px', fontWeight: 700 }}>
                        ⚠️ Review
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
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
                  <td style={{ padding: '10px 14px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.source_file_ref}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>
                    {item.git_commit_ref || '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => setSelectedRecord(item)}
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}>
                      Evidence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8' }}>
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

      {/* Evidence Detail Modal / Drawer */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {selectedRecord.component_id}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '4px 0 0 0' }}>
                  {selectedRecord.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}>
                Close
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
                <span style={{ backgroundColor: '#450a0a', color: '#fca5a5', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                  ⚠️ Flagged: {selectedRecord.review_reason}
                </span>
              )}
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Subsystem & Category:</span>
              <span style={detailValStyle}>{selectedRecord.subsystem} ({selectedRecord.category})</span>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Source File Reference:</span>
              <span style={{ ...detailValStyle, color: '#38bdf8', fontFamily: 'monospace' }}>
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
              <p style={{ backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                {selectedRecord.developer_notes || 'No developer notes provided.'}
              </p>
            </div>

            <div>
              <span style={detailLabelStyle}>Associated Tests:</span>
              <div style={{ backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1', margin: '4px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Summary:</strong> {selectedRecord.test_summary}</div>
                {selectedRecord.test_identifiers.map(t => (
                  <div key={t} style={{ fontFamily: 'monospace', color: '#38bdf8' }}>• {t}</div>
                ))}
              </div>
            </div>

            <div>
              <span style={detailLabelStyle}>Behavioral Hardware Parity Evidence:</span>
              <p style={{ backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', color: selectedRecord.validation_evidence ? '#6ee7b7' : '#94a3b8', margin: '4px 0 0 0' }}>
                {selectedRecord.validation_evidence || 'No behavioral hardware golden traces provided. Validation remains Not validated.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const kpiLabel: React.CSSProperties = {
  fontSize: '11px',
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontWeight: 600
};

const kpiVal: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#f8fafc'
};

const kpiSub: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748b'
};

const selectStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  minWidth: '160px'
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

const statusBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Implemented') return { backgroundColor: '#064e3b', color: '#6ee7b7', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Stub') return { backgroundColor: '#451a03', color: '#fde047', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Partial') return { backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#334155', color: '#94a3b8', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
};

const testingBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Passed' || status === 'Tests passed') return { backgroundColor: '#064e3b', color: '#6ee7b7', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Failed' || status === 'Tests failed') return { backgroundColor: '#450a0a', color: '#fca5a5', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Running' || status === 'Tests running') return { backgroundColor: '#0369a1', color: '#bae6fd', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#1e293b', color: '#64748b', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
};

const valBadgeStyle = (status: string): React.CSSProperties => {
  if (status === 'Behaviorally validated') return { backgroundColor: '#047857', color: '#a7f3d0', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  if (status === 'Partially validated') return { backgroundColor: '#0284c7', color: '#e0f2fe', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  return { backgroundColor: '#1e293b', color: '#64748b', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  borderBottom: '1px solid #1e293b',
  paddingBottom: '8px'
};

const detailLabelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontWeight: 600
};

const detailValStyle: React.CSSProperties = {
  color: '#f8fafc'
};
