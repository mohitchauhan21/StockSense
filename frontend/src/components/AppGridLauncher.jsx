import React from 'react';
import { 
  BarChart3, 
  Package, 
  Download, 
  Truck, 
  ArrowLeftRight, 
  Sliders, 
  BookOpen, 
  Warehouse,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const MODULES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    sub: 'KPIs & live stock valuation',
    desc: 'Aggregated warehouse metrics and system overview'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    sub: 'SKUs & reorder limits',
    desc: 'Master product catalog and unit definitions'
  },
  {
    id: 'receipts',
    label: 'Receipts',
    icon: Download,
    sub: 'Inbound PO intake',
    desc: 'Supplier shipments and intake validation'
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    icon: Truck,
    sub: 'Outbound dispatch',
    desc: 'Customer order picking, packing & shipment'
  },
  {
    id: 'transfers',
    label: 'Transfers',
    icon: ArrowLeftRight,
    sub: 'Inter-facility balance',
    desc: 'Internal movements between warehouse locations'
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    icon: Sliders,
    sub: 'Physical count audits',
    desc: 'Inventory reconciliation and variance write-offs'
  },
  {
    id: 'ledger',
    label: 'Stock Ledger',
    icon: BookOpen,
    sub: 'Immutable audit trail',
    desc: 'Append-only double-entry transaction log'
  },
  {
    id: 'warehouses',
    label: 'Warehouses',
    icon: Warehouse,
    sub: 'Storage & zones',
    desc: 'Facilities, storage bins and locations'
  },
];

export default function AppGridLauncher({ activeModule, onSelectModule, showLowStockOnly, onToggleLowStock }) {
  return (
    <section className="section-clean-light" id="app-grid-section">
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p className="section-eyebrow">
            Operations Console
          </p>
          <h2 className="section-headline">
            Select a module to manage inventory operations
          </h2>
        </div>

        {/* Balanced 4x2 Grid of 8 Operations Modules */}
        <div className="app-grid">
          {MODULES.map((mod) => {
            const IconComp = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                className={`app-tile-wrapper ${isActive ? 'active' : ''}`}
                onClick={() => onSelectModule(mod.id)}
                title={mod.desc}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="app-tile">
                  <IconComp 
                    size={22} 
                    color={isActive ? '#FFFFFF' : 'var(--color-accent)'} 
                    strokeWidth={2} 
                  />
                </div>

                <div className="app-tile-info">
                  <div className="app-tile-header">
                    <span className="app-tile-label">{mod.label}</span>
                    {isActive && (
                      <span className="app-tile-active-badge">
                        <span className="status-dot live" style={{ width: 5, height: 5 }} />
                        Active
                      </span>
                    )}
                  </div>
                  <span className="app-tile-sub">{mod.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action & Filter Bar (Status colors reserved strictly for real states) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '36px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '14px',
          color: 'var(--color-text-body)',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Real State Warning Filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
            <div 
              onClick={() => onToggleLowStock(!showLowStockOnly)}
              style={{
                width: '42px',
                height: '24px',
                borderRadius: '9999px',
                backgroundColor: showLowStockOnly ? 'var(--color-accent)' : '#CBD5E1',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: '3px',
                left: showLowStockOnly ? '21px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showLowStockOnly ? (
                <AlertTriangle size={15} color="var(--color-status-warning)" />
              ) : null}
              <span style={{ fontWeight: '500', color: showLowStockOnly ? 'var(--color-text-heading)' : 'var(--color-text-body)' }}>
                Filter: Show items below reorder threshold
              </span>
            </div>
          </label>

          {/* Plain Text Link to Audit Trail */}
          <a
            href="#ledger"
            onClick={(e) => { e.preventDefault(); onSelectModule('ledger'); }}
            style={{
              color: 'var(--color-accent)',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Audit full ledger transactions <ArrowRight size={15} />
          </a>
        </div>

      </div>
    </section>
  );
}
