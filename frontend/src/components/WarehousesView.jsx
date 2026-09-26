import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Warehouse, Plus, RefreshCw, X, MapPin } from 'lucide-react';

export default function WarehousesView() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState(null);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.getWarehouses();
      setWarehouses(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormErr(null);
    try {
      await api.createWarehouse({
        code,
        name,
        location_address: location,
      });
      setShowModal(false);
      setCode('');
      setName('');
      setLocation('');
      loadWarehouses();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="heading-xl">Warehouse Facilities</h2>
          <p className="body-text">Physical storage locations, distribution centers & codes.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-odoo-secondary" onClick={loadWarehouses} style={{ padding: '8px 14px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-odoo-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Grid of Warehouses */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
            No warehouses configured. Click "+ Add Warehouse" to set one up.
          </div>
        ) : (
          warehouses.map((w) => (
            <div key={w.id} className="odoo-card" style={{ borderTop: '4px solid var(--color-accent-orange)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  CODE: {w.code}
                </span>
                <Warehouse size={20} color="var(--color-accent-orange)" />
              </div>

              <h3 className="heading-md" style={{ marginBottom: '6px' }}>{w.name}</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-body)', marginTop: '8px' }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>{w.location_address || 'Central Storage Facility'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Warehouse */}
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
                <Warehouse color="var(--color-accent-orange)" size={22} /> Add Warehouse Location
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

            <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Warehouse Code *</label>
                <input
                  type="text"
                  required
                  className="odoo-input"
                  placeholder="e.g. WH-MAIN or WH-BLR"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Warehouse Name *</label>
                <input
                  type="text"
                  required
                  className="odoo-input"
                  placeholder="e.g. Central Bangalore Fulfillment Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Address / Location</label>
                <input
                  type="text"
                  className="odoo-input"
                  placeholder="e.g. Plot 42, Electronic City Phase 1, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-odoo-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-odoo-primary" disabled={creating}>
                  {creating ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
