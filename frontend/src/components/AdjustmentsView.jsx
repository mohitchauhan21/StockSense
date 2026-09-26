import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Sliders, Plus, CheckCircle, RefreshCw, X } from 'lucide-react';

export default function AdjustmentsView() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [countedQty, setCountedQty] = useState('15');
  const [reason, setReason] = useState('Annual Physical Audit Count');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, wRes] = await Promise.all([
        api.getAdjustments().catch(() => []),
        api.getProducts().catch(() => []),
        api.getWarehouses().catch(() => []),
      ]);
      setAdjustments(aRes || []);
      setProducts(pRes || []);
      setWarehouses(wRes || []);
      if (wRes && wRes.length > 0 && !warehouseId) {
        setWarehouseId(wRes[0].id);
      }
      if (pRes && pRes.length > 0 && !productId) {
        setProductId(pRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createAdjustment({
        warehouse_id: parseInt(warehouseId),
        reason: reason || 'Inventory Count Correction',
        items: [
          {
            product_id: parseInt(productId),
            counted_quantity: parseInt(countedQty) || 0,
          }
        ]
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await api.validateAdjustment(id);
      loadData();
    } catch (err) {
      alert(`Validation error: ${err.message}`);
    }
  };

  return (
    <div className="app-screen-container">
      
      {/* Header */}
      <div className="app-screen-header">
        <div>
          <h2 className="heading-xl">Physical Stock Adjustments</h2>
          <p className="body-text">Reconcile theoretical system count with physical warehouse counts.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Adjustment
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="app-table-container" style={{ marginBottom: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Warehouse</th>
                <th>Reason</th>
                <th>Discrepancy items</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    Loading adjustments...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    No stock adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map((a) => {
                  const isDone = a.status === 'DONE' || a.status === 'VALIDATED';
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary-blue)' }}>
                        {a.reference_number || `ADJ-${a.id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-heading)', fontWeight: '500' }}>
                        {a.warehouse?.name || `WH #${a.warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        {a.reason || 'Physical Audit'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                        {a.items ? a.items.length : 0} line(s)
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isDone ? (
                          <span className="status-pill status-pill-success">
                            <span className="status-dot"></span> Validated
                          </span>
                        ) : (
                          <span className="status-pill status-pill-warning">
                            <span className="status-dot"></span> Draft / Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isDone && (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleValidate(a.id)}
                          >
                            <CheckCircle size={14} /> Validate & Sync Ledger
                          </button>
                        )}
                        {isDone && (
                          <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Reconciled in Ledger
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Adjustment */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="app-card" style={{ width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-elevation)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)' }}>
                  <Sliders size={18} />
                </div>
                Create Inventory Adjustment
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-body)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formErr && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {formErr}
              </div>
            )}

            <form onSubmit={handleCreateAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Warehouse Facility *</label>
                <select
                  required
                  className="app-input"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Adjustment Reason / Reference</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="e.g. Broken stock, quarterly physical audit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Target Product *</label>
                  <select
                    required
                    className="app-input"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}] (Current: {p.current_stock !== undefined ? p.current_stock : '?'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Actual Counted Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="app-input"
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Saving...' : 'Create Adjustment Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
