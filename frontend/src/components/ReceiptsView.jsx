import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Download, Plus, CheckCircle, RefreshCw, X } from 'lucide-react';

export default function ReceiptsView() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [vendor, setVendor] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes, wRes] = await Promise.all([
        api.getReceipts().catch(() => []),
        api.getProducts().catch(() => []),
        api.getWarehouses().catch(() => []),
      ]);
      setReceipts(rRes || []);
      setProducts(pRes || []);
      setWarehouses(wRes || []);
      if (wRes && wRes.length > 0 && !destWarehouseId) {
        setDestWarehouseId(wRes[0].id);
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

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createReceipt({
        vendor_name: vendor || 'Generic Supplier Co.',
        destination_warehouse_id: parseInt(destWarehouseId),
        items: [
          {
            product_id: parseInt(productId),
            quantity: parseInt(quantity) || 1,
          }
        ]
      });
      setShowModal(false);
      setVendor('');
      loadData();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await api.validateReceipt(id);
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
          <h2 className="heading-xl">Incoming Receipts (GRN)</h2>
          <p className="body-text">Vendor purchase orders & incoming stock receipts into warehouses.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-odoo-secondary" onClick={loadData} style={{ padding: '8px 14px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-odoo-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Receipt
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
                <th style={{ padding: '14px 18px' }}>Vendor</th>
                <th style={{ padding: '14px 18px' }}>Destination Warehouse</th>
                <th style={{ padding: '14px 18px' }}>Items Total</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    No incoming receipts recorded yet. Click "Create Receipt" to add one.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => {
                  const isDone = r.status === 'DONE' || r.status === 'VALIDATED';
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary)' }}>
                        {r.reference_number || `REC-${r.id}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        {r.vendor_name || 'Vendor'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        {r.destination_warehouse?.name || `Warehouse #${r.destination_warehouse_id}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                        {r.items ? r.items.reduce((acc, i) => acc + i.quantity, 0) : 0} units
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isDone ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px' }}>
                            DONE
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 8px', borderRadius: '6px' }}>
                            DRAFT / READY
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isDone && (
                          <button
                            className="btn-odoo-primary"
                            onClick={() => handleValidate(r.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <CheckCircle size={12} /> Validate & Receive Stock
                          </button>
                        )}
                        {isDone && (
                          <span style={{ fontSize: '12px', color: '#15803D', fontWeight: '600' }}>
                            ✓ Stock Posted to Ledger
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

      {/* Modal: Create Receipt */}
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
                <Download color="var(--color-primary)" size={22} /> Create Incoming Receipt
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

            <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Vendor / Supplier Name</label>
                <input
                  type="text"
                  className="odoo-input"
                  placeholder="e.g. Acme Tech Components Ltd."
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Destination Warehouse *</label>
                <select
                  required
                  className="odoo-input"
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Select Product *</label>
                  <select
                    required
                    className="odoo-input"
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="odoo-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-odoo-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-odoo-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Receipt Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
