import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Package, Warehouse, AlertTriangle, Layers, Plus, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DashboardView({ onSelectModule, showLowStockOnly }) {
  const [kpis, setKpis] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, lowRes] = await Promise.all([
        api.getDashboardKPIs().catch(() => null),
        api.getLowStockAlerts().catch(() => []),
      ]);
      setKpis(kpiRes);
      setLowStockAlerts(lowRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Inventory Overview
            <span style={{
              fontSize: '12px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '9999px'
            }}>
              LIVE SYNCED
            </span>
          </h2>
          <p className="body-text">Real-time stock balance, warehouse occupancy & reorder warnings.</p>
        </div>

        <button 
          className="btn-odoo-secondary" 
          onClick={loadData}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          ⚠️ Could not connect to backend: {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-body)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Products</span>
            <Package size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-heading)' }}>
            {kpis ? kpis.total_products : (loading ? '...' : 0)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-body)' }}>Active catalog items</span>
        </div>

        <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-body)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Warehouses</span>
            <Warehouse size={20} color="var(--color-accent-teal)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-heading)' }}>
            {kpis ? kpis.total_warehouses : (loading ? '...' : 0)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-body)' }}>Storage facilities</span>
        </div>

        <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-accent-orange)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-body)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock Alerts</span>
            <AlertTriangle size={20} color="var(--color-accent-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: lowStockAlerts.length > 0 ? 'var(--color-accent-coral)' : 'var(--color-text-heading)' }}>
            {kpis ? kpis.low_stock_count : (loading ? '...' : 0)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-body)' }}>Items below reorder point</span>
        </div>

        <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-body)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Stock Qty</span>
            <Layers size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-heading)' }}>
            {kpis ? kpis.total_stock_quantity : (loading ? '...' : 0)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-body)' }}>Units across all locations</span>
        </div>
      </div>

      {/* Low Stock Warning Section */}
      <div className="odoo-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--color-accent-orange)" />
              Reorder Point Warnings & Low Stock Items
            </h3>
            <p className="body-text" style={{ fontSize: '13px' }}>Items requiring immediate replenishment or receipt creation.</p>
          </div>
          <button className="btn-odoo-primary" onClick={() => onSelectModule('receipts')} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Plus size={14} /> Create Receipt (GRN)
          </button>
        </div>

        {lowStockAlerts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1'
          }}>
            <CheckCircle2 size={32} color="var(--color-accent-teal)" style={{ marginBottom: '8px' }} />
            <p style={{ fontWeight: '600', color: 'var(--color-text-heading)' }}>All stock levels are optimal!</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-body)' }}>No inventory items are currently below their minimum reorder point thresholds.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-body)' }}>
                  <th style={{ padding: '10px 14px' }}>SKU</th>
                  <th style={{ padding: '10px 14px' }}>Product Name</th>
                  <th style={{ padding: '10px 14px' }}>Current Stock</th>
                  <th style={{ padding: '10px 14px' }}>Min Reorder Point</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary)' }}>
                      {item.sku}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-accent-coral)' }}>
                      {item.current_stock}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-body)' }}>
                      {item.min_reorder_point}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        REORDER NEEDED
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button 
                        className="btn-odoo-secondary"
                        onClick={() => onSelectModule('receipts')}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Restock →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Access Action Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div className="odoo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="heading-md" style={{ marginBottom: '6px' }}>Catalog & Products</h4>
            <p className="body-text" style={{ fontSize: '13px', marginBottom: '16px' }}>Manage stock units, SKUs, unit costs & reorder limits.</p>
          </div>
          <button className="btn-odoo-secondary" onClick={() => onSelectModule('products')}>
            Open Products Catalog <ArrowRight size={14} />
          </button>
        </div>

        <div className="odoo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="heading-md" style={{ marginBottom: '6px' }}>Double-Entry Ledger Log</h4>
            <p className="body-text" style={{ fontSize: '13px', marginBottom: '16px' }}>Audit all historical movements, physical counts & balance changes.</p>
          </div>
          <button className="btn-odoo-secondary" onClick={() => onSelectModule('ledger')}>
            View Immutable Ledger <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
