import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { ArrowLeftRight, Plus, CheckCircle, RefreshCw, X } from 'lucide-react';

export default function TransfersView() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('2');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, pRes, wRes] = await Promise.all([
        api.getTransfers().catch(() => []),
        api.getProducts().catch(() => []),
        api.getWarehouses().catch(() => []),
      ]);
      setTransfers(tRes || []);
      setProducts(pRes || []);
      setWarehouses(wRes || []);
      if (wRes && wRes.length >= 2) {
        if (!sourceId) setSourceId(wRes[0].id);
        if (!destId) setDestId(wRes[1].id);
      } else if (wRes && wRes.length === 1) {
        if (!sourceId) setSourceId(wRes[0].id);
        if (!destId) setDestId(wRes[0].id);
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

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createTransfer({
        source_warehouse_id: parseInt(sourceId),
        destination_warehouse_id: parseInt(destId),
        items: [
          {
            product_id: parseInt(productId),
            quantity: parseInt(quantity) || 1,
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
      await api.validateTransfer(id);
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
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowLeftRight size={24} color="var(--color-primary-blue)" />
            Internal Stock Transfers
          </h2>
          <p className="body-text">Warehouse-to-warehouse stock relocations with atomic balance updates.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Transfer
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
                <th>Source Warehouse</th>
                <th>Destination Warehouse</th>
                <th>Items Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    No internal transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => {
                  const isDone = t.status === 'DONE' || t.status === 'VALIDATED';
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary-blue)' }}>
                        {t.reference_number || `TRF-${t.id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-heading)', fontWeight: '500' }}>
                        {t.source_warehouse?.name || `WH #${t.source_warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-heading)', fontWeight: '500' }}>
                        {t.destination_warehouse?.name || `WH #${t.destination_warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                        {t.items ? t.items.reduce((acc, i) => acc + i.quantity, 0) : 0} units
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isDone ? (
                          <span className="status-pill status-pill-success">
                            <span className="status-dot"></span> Transferred
                          </span>
                        ) : (
                          <span className="status-pill status-pill-warning">
                            <span className="status-dot"></span> Draft / Ready
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isDone && (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleValidate(t.id)}
                          >
                            <CheckCircle size={14} /> Validate & Transfer
                          </button>
                        )}
                        {isDone && (
                          <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Transferred & Synced
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

      {/* Modal: Create Transfer */}
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
                  <ArrowLeftRight size={18} />
                </div>
                Create Internal Transfer
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

            <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Source Warehouse *</label>
                  <select
                    required
                    className="app-input"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Destination Warehouse *</label>
                  <select
                    required
                    className="app-input"
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Select Product *</label>
                  <select
                    required
                    className="app-input"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="app-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Transfer Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
