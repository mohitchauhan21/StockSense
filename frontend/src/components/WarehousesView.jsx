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
    <div className="app-screen-container">
      
      {/* Header */}
      <div className="app-screen-header">
        <div>
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Warehouse size={24} color="var(--color-primary-blue)" />
            Warehouse Facilities
          </h2>
          <p className="body-text">Physical storage locations, distribution centers & facility codes.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadWarehouses}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Grid of Warehouses */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--color-text-body)' }}>
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="app-card" style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center' }}>
            <div className="stat-card-icon-wrap" style={{ margin: '0 auto 16px auto', width: '48px', height: '48px' }}>
              <Warehouse size={24} />
            </div>
            <h3 className="heading-md" style={{ marginBottom: '8px' }}>No warehouses configured yet</h3>
            <p className="body-text" style={{ maxWidth: '400px', margin: '0 auto 20px auto' }}>
              Create your primary warehouse or fulfillment center to begin tracking inventory across locations.
            </p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add First Warehouse
            </button>
          </div>
        ) : (
          warehouses.map((w) => (
            <div key={w.id} className="app-card app-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  CODE: {w.code}
                </span>
                <div className="stat-card-icon-wrap" style={{ width: '36px', height: '36px' }}>
                  <Warehouse size={18} />
                </div>
              </div>

              <h3 className="heading-md" style={{ margin: '4px 0 0 0', fontSize: '16px' }}>{w.name}</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-body)', marginTop: '4px' }}>
                <MapPin size={14} color="var(--color-primary-blue)" />
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
                  <Warehouse size={18} />
                </div>
                Add Warehouse Location
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

            <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Warehouse Code *</label>
                <input
                  type="text"
                  required
                  className="app-input"
                  placeholder="e.g. WH-MAIN or WH-BLR"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Warehouse Name *</label>
                <input
                  type="text"
                  required
                  className="app-input"
                  placeholder="e.g. Central Bangalore Fulfillment Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-text-heading)' }}>Address / Location</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="e.g. Plot 42, Electronic City Phase 1, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
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
