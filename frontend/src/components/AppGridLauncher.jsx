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
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MODULES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    color1: '#5B2A5E',
    color2: '#F4A83B',
    desc: 'KPIs, stock metrics & low-stock alerts'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    color1: '#1FA98E',
    color2: '#F4A83B',
    desc: 'Catalog, SKUs & reorder limits'
  },
  {
    id: 'receipts',
    label: 'Receipts (GRN)',
    icon: Download,
    color1: '#5B2A5E',
    color2: '#1FA98E',
    desc: 'Incoming vendor purchase stock'
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    icon: Truck,
    color1: '#F16B5C',
    color2: '#F4A83B',
    desc: 'Outgoing customer sales stock'
  },
  {
    id: 'transfers',
    label: 'Transfers',
    icon: ArrowLeftRight,
    color1: '#2563EB',
    color2: '#1FA98E',
    desc: 'Internal warehouse-to-warehouse moves'
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    icon: Sliders,
    color1: '#8B5CF6',
    color2: '#F4A83B',
    desc: 'Physical count corrections & audits'
  },
  {
    id: 'ledger',
    label: 'Move History',
    icon: BookOpen,
    color1: '#1FA98E',
    color2: '#F16B5C',
    desc: 'Immutable append-only transaction log'
  },
  {
    id: 'warehouses',
    label: 'Warehouses',
    icon: Warehouse,
    color1: '#F4A83B',
    color2: '#5B2A5E',
    desc: 'Physical storage locations & codes'
  },
];

export default function AppGridLauncher({ activeModule, onSelectModule, showLowStockOnly, onToggleLowStock }) {
  return (
    <section className="odoo-section-light" id="app-grid-section">
      {/* 4. Curved SVG Section Divider */}
      <div className="curved-divider-top">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z" 
            fill="var(--color-bg-light)"
          ></path>
        </svg>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '6px'
          }}>
            StockSense Apps Launcher
          </h2>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
            Select a module to manage inventory operations
          </p>
        </div>

        {/* 5.4 App Grid (6 columns desktop) */}
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
              >
                <div className="app-tile">
                  {/* Duo-tone Flat Geometric Icon */}
                  <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      position: 'absolute',
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      backgroundColor: mod.color2,
                      opacity: 0.25,
                      top: '2px',
                      right: '2px'
                    }}></div>
                    <IconComp size={28} color={mod.color1} strokeWidth={2.2} />
                  </div>
                </div>
                <span className="app-tile-label">{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5.5 Toggle + Link Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #E2E2EA',
          fontSize: '14px',
          color: 'var(--color-text-body)'
        }}>
          {/* Toggle on Left */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
            <div 
              onClick={() => onToggleLowStock(!showLowStockOnly)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '9999px',
                backgroundColor: showLowStockOnly ? 'var(--color-primary)' : '#CBD5E1',
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
                left: showLowStockOnly ? '23px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }} />
            </div>
            <Sparkles size={16} color="var(--color-accent-orange)" />
            <span style={{ fontWeight: '500' }}>Filter: Show low-stock items only</span>
          </label>

          {/* Plain Text Link on Right */}
          <a
            href="#all-modules"
            onClick={(e) => { e.preventDefault(); onSelectModule('ledger'); }}
            style={{
              color: 'var(--color-primary)',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View full ledger move history <ArrowRight size={16} />
          </a>
        </div>

      </div>
    </section>
  );
}
