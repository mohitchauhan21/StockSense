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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="heading-xl">Physical Stock Adjustments</h2>
          <p className="body-text">Reconcile theoretical system count with physical warehouse counts.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-odoo-secondary" onClick={loadData} style={{ padding: '8px 14px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-odoo-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Adjustment
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="odoo-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-heading)' }}>
                <th style={{ padding: '14px 18px' }}>Reference #</th>
                <th style={{ padding: '14px 18px' }}>Warehouse</th>
                <th style={{ padding: '14px 18px' }}>Reason</th>
                <th style={{ padding: '14px 18px' }}>Discrepancy items</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
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
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#8B5CF6' }}>
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
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px' }}>
                            DONE
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 8px', borderRadius: '6px' }}>
                            DRAFT / PENDING
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isDone && (
                          <button
                            className="btn-odoo-primary"
                            onClick={() => handleValidate(a.id)}
                            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#8B5CF6' }}
                          >
                            <CheckCircle size={12} /> Post Adjustment & Sync Ledger
                          </button>
                        )}
                        {isDone && (
                          <span style={{ fontSize: '12px', color: '#15803D', fontWeight: '600' }}>
                            ✓ Reconciled in Ledger
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
          backgroundColor: 'rgba(27, 27, 47, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="odoo-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders color="#8B5CF6" size={22} /> Create Inventory Adjustment
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-body)" />
              </button>
            </div>

            {formErr && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {formErr}
              </div>
            )}

            <form onSubmit={handleCreateAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Warehouse Facility *</label>
                <select
                  required
                  className="odoo-input"
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Adjustment Reason / Reference</label>
                <input
                  type="text"
                  className="odoo-input"
                  placeholder="e.g. Broken stock, quarterly physical audit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Target Product *</label>
                  <select
                    required
                    className="odoo-input"
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Actual Counted Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="odoo-input"
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-odoo-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-odoo-primary" disabled={creating} style={{ backgroundColor: '#8B5CF6' }}>
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
