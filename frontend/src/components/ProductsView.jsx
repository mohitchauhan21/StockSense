import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Package, Plus, Search, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ProductsView({ showLowStockOnly }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State matching ProductCreate schema exactly
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Units');
  const [reorderPoint, setReorderPoint] = useState('10');
  const [reorderQty, setReorderQty] = useState('50');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
      ]);
      setProducts(pRes || []);
      setCategories(cRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createProduct({
        sku,
        name,
        category_id: categoryId ? parseInt(categoryId) : null,
        unit_of_measure: unitOfMeasure || 'Units',
        reorder_point: parseFloat(reorderPoint) || 0,
        reorder_qty: parseFloat(reorderQty) || 0,
      });
      setShowModal(false);
      setSku('');
      setName('');
      setCategoryId('');
      setUnitOfMeasure('Units');
      setReorderPoint('10');
      setReorderQty('50');
      loadData();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const stockVal = p.current_stock ?? p.total_quantity ?? 0;
    const reorderVal = p.reorder_point ?? 0;
    const isLow = stockVal <= reorderVal;
    const matchesLowStock = !showLowStockOnly || isLow;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="app-screen-container">
      
      {/* Action Header */}
      <div className="app-screen-header">
        <div>
          <h2 className="heading-xl">Product Catalog</h2>
          <p className="body-text">Master items list, current stock balances & minimum reorder limits.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="app-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--color-text-body)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="app-input"
            placeholder="Search by SKU or Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        {showLowStockOnly && (
          <span className="status-pill warning">
            Filtering: Low Stock Only
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="app-table-container" style={{ marginBottom: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Unit of Measure</th>
                <th>Stock Balance</th>
                <th>Reorder Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockVal = p.current_stock ?? p.total_quantity ?? 0;
                  const reorderVal = p.reorder_point ?? 0;
                  const isLow = stockVal <= reorderVal;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary)' }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        <div>{p.name}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)', fontWeight: '500' }}>
                        {p.unit_of_measure || 'Units'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '15px', color: isLow ? 'var(--color-accent-coral)' : 'var(--color-text-heading)' }}>
                        {stockVal} {p.unit_of_measure || 'units'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        Min: {reorderVal} | Qty: {p.reorder_qty ?? 0}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isLow ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> REORDER NEEDED
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> IN STOCK
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

      {/* Modal: Create Product */}
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
          <div className="app-card" style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package color="var(--color-primary)" size={22} /> Add New Product
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-body)" />
              </button>
            </div>

            {formErr && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {formErr}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>SKU (Unique Code) *</label>
                <input
                  type="text"
                  required
                  className="app-input"
                  placeholder="e.g. LAP-001 or MAC-M3"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  className="app-input"
                  placeholder="e.g. MacBook Pro M3 16-inch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Category</label>
                  <select
                    className="app-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Unit of Measure</label>
                  <select
                    className="app-input"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                  >
                    <option value="Units">Units (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Liters">Liters</option>
                    <option value="Meters">Meters</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Min Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    className="app-input"
                    placeholder="10"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Standard Reorder Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="app-input"
                    placeholder="50"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
