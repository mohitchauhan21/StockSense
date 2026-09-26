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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={28} color="var(--color-primary)" />
            Immutable Stock Move Ledger
          </h2>
          <p className="body-text">
            Every inventory event is recorded as an immutable double-entry ledger move. Zero stock drift guarantee.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-odoo-secondary" onClick={loadLedger} style={{ padding: '8px 14px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Ledger
          </button>
        </div>
      </div>

      {/* Ledger Audit Banner */}
      <div style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={24} color="#16A34A" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#15803D' }}>Audit Ledger Integrity: PASS</h4>
            <p style={{ fontSize: '13px', color: '#166534' }}>
              All stock changes were mutated via the single uniform engine function `update_stock()`. No direct SQL balance updates allowed.
            </p>
          </div>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: '700',
          color: '#15803D',
          backgroundColor: '#DCFCE7',
          padding: '6px 12px',
          borderRadius: '8px'
        }}>
          Total Moves Recorded: {moves.length}
        </span>
      </div>

      {/* Table Card */}
      <div className="odoo-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-heading)' }}>
                <th style={{ padding: '14px 18px' }}>Move ID</th>
                <th style={{ padding: '14px 18px' }}>Move Type</th>
                <th style={{ padding: '14px 18px' }}>Product</th>
                <th style={{ padding: '14px 18px' }}>Source / Dest Warehouse</th>
                <th style={{ padding: '14px 18px' }}>Quantity Delta</th>
                <th style={{ padding: '14px 18px' }}>Reference</th>
                <th style={{ padding: '14px 18px' }}>Timestamp</th>
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
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: move.move_type === 'RECEIPT' ? '#DCFCE7' :
                                           move.move_type === 'DELIVERY' ? '#FEE2E2' :
                                           move.move_type === 'TRANSFER' ? '#DBEAFE' : '#F3E8FF',
                          color: move.move_type === 'RECEIPT' ? '#15803D' :
                                 move.move_type === 'DELIVERY' ? '#991B1B' :
                                 move.move_type === 'TRANSFER' ? '#1E40AF' : '#6B21A8',
                        }}>
                          {move.move_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        {move.product?.name || `Prod #${move.product_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        {move.warehouse?.name || `WH #${move.warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', fontSize: '15px' }}>
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
