import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { FolderTree, Plus, RefreshCw, X, Layers } from 'lucide-react';

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createCategory({
        name,
        parent_id: parentId ? parseInt(parentId) : null,
      });
      setShowModal(false);
      setName('');
      setParentId('');
      loadCategories();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-screen-container">
      
      {/* Header */}
      <div className="app-screen-header">
        <div>
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderTree size={24} color="var(--color-primary-blue)" />
            Product Categories
          </h2>
          <p className="body-text">Taxonomy structure & parent-child category hierarchies.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadCategories}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="app-card" style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center' }}>
            <div className="stat-card-icon-wrap" style={{ margin: '0 auto 16px auto', width: '48px', height: '48px' }}>
              <FolderTree size={24} />
            </div>
            <h3 className="heading-md" style={{ marginBottom: '8px' }}>No categories created yet</h3>
            <p className="body-text" style={{ maxWidth: '400px', margin: '0 auto 20px auto' }}>
              Define product categories and taxonomy groups to organize your inventory.
            </p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add First Category
            </button>
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="app-card app-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: '#F1F5F9',
                  color: 'var(--color-text-body)',
                  border: '1px solid var(--color-border)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  CAT #{c.id}
                </span>
                <div className="stat-card-icon-wrap" style={{ width: '36px', height: '36px' }}>
                  <FolderTree size={18} />
                </div>
              </div>

              <h3 className="heading-md" style={{ margin: '4px 0 0 0', fontSize: '16px' }}>{c.name}</h3>

              {c.parent_id && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-body)', marginTop: '2px' }}>
                  Parent Category ID: #{c.parent_id}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Category */}
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
          <div className="app-card" style={{ width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-elevation)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '18px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)' }}>
                  <FolderTree size={18} />
                </div>
                Add Product Category
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

            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  className="app-input"
                  placeholder="e.g. Electronics or Raw Materials"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Parent Category (Optional)</label>
                <select
                  className="app-input"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
