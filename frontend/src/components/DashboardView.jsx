import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Package, Warehouse, AlertTriangle, Layers, Plus, ArrowRight, RefreshCw, CheckCircle2, PackagePlus } from 'lucide-react';

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

  const totalProducts = kpis?.total_products ?? 0;
  const totalWarehouses = kpis?.total_warehouses ?? 0;
  const totalStockQty = kpis?.total_stock_quantity ?? 0;
  const lowStockCount = kpis?.low_stock_count ?? lowStockAlerts.length;
  
  // Genuine empty state: no products or stock recorded in database
  const isCatalogEmpty = !loading && (totalProducts === 0 && totalWarehouses === 0 && totalStockQty === 0);
  const hasLiveSync = !loading && !error && (totalProducts > 0 || totalWarehouses > 0);

  return (
    <div className="app-screen-container">
      
      {/* Screen Header Bar */}
      <div className="app-screen-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="heading-xl">Inventory Overview</h2>
            {hasLiveSync && (
              <span className="status-pill status-pill-success">
                <span className="status-dot live" /> LIVE SYNCED
              </span>
            )}
          </div>
          <p className="body-text">Real-time stock balance, warehouse occupancy & reorder warnings.</p>
        </div>

        <button 
          className="btn-secondary" 
          onClick={loadData}
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
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          ⚠️ Could not connect to backend: {error}
        </div>
      )}

      {/* Restrained Stat Cards (Requirement 3: Clean neutral backgrounds, no garish left borders) */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Products</span>
            <div className="stat-card-icon-wrap">
              <Package size={18} color="var(--color-primary)" />
            </div>
          </div>
          <div className="stat-card-value">
            {loading ? '...' : totalProducts}
          </div>
          <span className="stat-card-sub">Active catalog items</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Warehouses</span>
            <div className="stat-card-icon-wrap accent">
              <Warehouse size={18} color="var(--color-accent)" />
            </div>
          </div>
          <div className="stat-card-value">
            {loading ? '...' : totalWarehouses}
          </div>
          <span className="stat-card-sub">Storage facilities</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Low Stock Alerts</span>
            <div className={`stat-card-icon-wrap ${lowStockCount > 0 ? 'warning' : ''}`}>
              <AlertTriangle size={18} color={lowStockCount > 0 ? 'var(--color-status-warning)' : 'var(--color-text-muted)'} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: lowStockCount > 0 ? 'var(--color-status-warning)' : 'var(--color-text-heading)' }}>
            {loading ? '...' : lowStockCount}
          </div>
          <span className="stat-card-sub">
            {lowStockCount > 0 ? (
              <span style={{ color: 'var(--color-status-warning)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="status-dot warning" /> Requires reorder
              </span>
            ) : 'All safety limits met'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Stock Units</span>
            <div className="stat-card-icon-wrap">
              <Layers size={18} color="var(--color-primary)" />
            </div>
          </div>
          <div className="stat-card-value">
            {loading ? '...' : totalStockQty}
          </div>
          <span className="stat-card-sub">Units across all locations</span>
        </div>
      </div>

      {/* Main Stock Status & Alerts Section */}
      <div className="app-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color={lowStockCount > 0 ? 'var(--color-status-warning)' : 'var(--color-text-body)'} />
              Reorder Point Warnings & Stock Level Status
            </h3>
            <p className="body-text" style={{ fontSize: '13px' }}>Items requiring immediate replenishment or receipt creation.</p>
          </div>
          <button className="btn-primary" onClick={() => onSelectModule('receipts')}>
            <Plus size={14} /> Create Receipt (GRN)
          </button>
        </div>

        {/* Requirement 2: Genuine onboarding empty state when total products/warehouses/stock are 0 */}
        {isCatalogEmpty ? (
          <div className="app-onboarding-card">
            <div className="app-onboarding-icon">
              <PackagePlus size={26} />
            </div>
            <h4 className="heading-md" style={{ marginBottom: '6px' }}>
              No products yet — add your first item to get started
            </h4>
            <p className="body-text" style={{ fontSize: '13.5px', maxWidth: '520px', margin: '0 auto 20px', color: 'var(--color-text-body)' }}>
              Your inventory database is empty. Add products with SKUs, units of measure, and safety reorder thresholds to begin tracking live stock movements and ledger balance adjustments.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => onSelectModule('products')}>
                <Plus size={14} /> Add Product to Catalog
              </button>
              <button className="btn-secondary" onClick={() => onSelectModule('warehouses')}>
                <Warehouse size={14} /> Configure Warehouses
              </button>
            </div>
          </div>
        ) : lowStockAlerts.length === 0 ? (
          /* Genuine Optimal State: Total products > 0 and no low stock alerts */
          <div className="app-status-card-optimal">
            <CheckCircle2 size={26} color="var(--color-status-success)" />
            <div>
              <p style={{ fontWeight: '600', color: 'var(--color-text-heading)', fontSize: '14px' }}>
                All stock levels are optimal
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-body)' }}>
                All {totalProducts} items in your catalog are currently maintaining quantities at or above their safety reorder point thresholds.
              </p>
            </div>
          </div>
        ) : (
          /* Low Stock Warnings Table */
          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Min Reorder Point</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-primary)' }}>
                      {item.sku}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--color-text-heading)' }}>
                      {item.name}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-status-warning)' }}>
                      {item.current_stock}
                    </td>
                    <td>
                      {item.min_reorder_point}
                    </td>
                    <td>
                      <span className="status-pill status-pill-warning">
                        <span className="status-dot"></span> Reorder Needed
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => onSelectModule('receipts')}
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

      {/* Quick Access Action Grid (Requirement 1: Consistent Button Hierarchy) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="heading-md" style={{ marginBottom: '6px' }}>Catalog & Products</h4>
            <p className="body-text" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Manage master stock units, SKUs, barcode mappings, and minimum safety reorder limits.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => onSelectModule('products')}>
            Open Products Catalog <ArrowRight size={14} />
          </button>
        </div>

        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="heading-md" style={{ marginBottom: '6px' }}>Double-Entry Move Ledger</h4>
            <p className="body-text" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Audit all historical receipts, customer deliveries, inter-warehouse transfers & balance reconciliations.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => onSelectModule('ledger')}>
            View Immutable Ledger <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
