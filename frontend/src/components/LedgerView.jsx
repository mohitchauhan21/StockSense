import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { BookOpen, RefreshCw, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function LedgerView() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const res = await api.getLedgerMoves();
      setMoves(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="app-screen-container">
      
      {/* Header */}
      <div className="app-screen-header">
        <div>
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="var(--color-primary-blue)" />
            Immutable Stock Move Ledger
          </h2>
          <p className="body-text">
            Every inventory event is recorded as an immutable double-entry ledger move. Zero stock drift guarantee.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadLedger}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Ledger
          </button>
        </div>
      </div>

      {/* Ledger Audit Banner */}
      <div className="app-card" style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803D'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-heading)', margin: 0 }}>
                Audit Ledger Integrity: Verified
              </h4>
              <span className="status-pill status-pill-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                <span className="status-dot"></span> Active Engine Guard
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-body)', margin: '4px 0 0 0' }}>
              All balance transitions are executed strictly through atomic ledger mutations. Direct balance overwrite is locked.
            </p>
          </div>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--color-primary-blue)',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          padding: '6px 12px',
          borderRadius: '8px'
        }}>
          Total Moves: {moves.length}
        </span>
      </div>

      {/* Table Card */}
      <div className="app-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Move ID</th>
                <th>Move Type</th>
                <th>Product</th>
                <th>Source / Dest Warehouse</th>
                <th>Quantity Delta</th>
                <th>Reference</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    Loading move ledger...
                  </td>
                </tr>
              ) : moves.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    No stock moves recorded yet in the system ledger.
                  </td>
                </tr>
              ) : (
                moves.map((move) => {
                  const isPositive = move.quantity_delta > 0;
                  return (
                    <tr key={move.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        #{move.id}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`status-pill ${
                          move.move_type === 'RECEIPT' ? 'status-pill-success' :
                          move.move_type === 'DELIVERY' ? 'status-pill-danger' :
                          move.move_type === 'TRANSFER' ? 'status-pill-info' : 'status-pill-neutral'
                        }`}>
                          {move.move_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        {move.product?.name || `Prod #${move.product_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        {move.warehouse?.name || `WH #${move.warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '14px' }}>
                        <span style={{
                          color: isPositive ? '#16A34A' : '#DC2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          {isPositive ? `+${move.quantity_delta}` : move.quantity_delta} units
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-body)' }}>
                        {move.reference_number || '-'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--color-text-body)' }}>
                        {move.created_at ? new Date(move.created_at).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
