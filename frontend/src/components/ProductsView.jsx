import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Package, Plus, Search, RefreshCw, X } from 'lucide-react';

export default function ProductsView({ showLowStockOnly }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [minReorderPoint, setMinReorderPoint] = useState('10');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createProduct({
        sku,
        name,
        description,
        unit_cost: parseFloat(unitCost) || 0,
        min_reorder_point: parseInt(minReorderPoint) || 0,
      });
      setShowModal(false);
      setSku('');
      setName('');
      setDescription('');
      setUnitCost('');
      loadProducts();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !showLowStockOnly || (p.current_stock !== undefined && p.current_stock <= p.min_reorder_point);
    return matchesSearch && matchesLowStock;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="heading-xl">Product Catalog</h2>
          <p className="body-text">Master items list, current stock balances & reorder configuration.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-odoo-secondary" onClick={loadProducts} style={{ padding: '8px 14px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button className="btn-odoo-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="odoo-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--color-text-body)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="odoo-input"
            placeholder="Search by SKU or Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        {showLowStockOnly && (
          <span style={{ fontSize: '13px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
            Filtering: Low Stock Only
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="odoo-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-heading)' }}>
                <th style={{ padding: '14px 18px' }}>SKU</th>
                <th style={{ padding: '14px 18px' }}>Product Name</th>
                <th style={{ padding: '14px 18px' }}>Unit Cost</th>
                <th style={{ padding: '14px 18px' }}>Stock Balance</th>
                <th style={{ padding: '14px 18px' }}>Reorder Point</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
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
                  const isLow = p.current_stock !== undefined && p.current_stock <= p.min_reorder_point;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary)' }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                        <div>{p.name}</div>
                        {p.description && <div style={{ fontSize: '12px', color: 'var(--color-text-body)', fontWeight: '400' }}>{p.description}</div>}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '500' }}>
                        ₹{parseFloat(p.unit_cost || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '15px', color: isLow ? 'var(--color-accent-coral)' : 'var(--color-text-heading)' }}>
                        {p.current_stock !== undefined ? p.current_stock : 0} units
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-body)' }}>
                        {p.min_reorder_point} units
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isLow ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 8px', borderRadius: '6px' }}>
                            LOW STOCK
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px' }}>
                            IN STOCK
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
          <div className="odoo-card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package color="var(--color-primary)" size={22} /> Add New Product
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

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>SKU (Unique Code) *</label>
                <input
                  type="text"
                  required
                  className="odoo-input"
                  placeholder="e.g. LAP-001 or MAC-M3"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  className="odoo-input"
                  placeholder="e.g. MacBook Pro M3 16-inch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Description</label>
                <textarea
                  className="odoo-input"
                  rows="2"
                  placeholder="Optional specifications or category details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="odoo-input"
                    placeholder="0.00"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Min Reorder Point</label>
                  <input
                    type="number"
                    className="odoo-input"
                    placeholder="10"
                    value={minReorderPoint}
                    onChange={(e) => setMinReorderPoint(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-odoo-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-odoo-primary" disabled={creating}>
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
