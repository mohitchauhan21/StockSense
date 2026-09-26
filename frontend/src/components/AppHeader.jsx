import React from 'react';
import { ArrowLeft, Bell, Search, ShieldCheck } from 'lucide-react';

export default function AppHeader({ activeModule, onReturnHome }) {
  const getModuleTitle = (mod) => {
    switch (mod) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Product Catalog';
      case 'receipts': return 'Incoming Receipts (GRN)';
      case 'deliveries': return 'Delivery Orders (Sales Out)';
      case 'transfers': return 'Internal Stock Transfers';
      case 'adjustments': return 'Physical Stock Adjustments';
      case 'ledger': return 'Immutable Move History Ledger';
      case 'warehouses': return 'Warehouse Facilities';
      case 'categories': return 'Product Categories';
      default: return 'Inventory Console';
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: Breadcrumbs & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onReturnHome}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-body)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600'
          }}
          title="Back to Landing Page"
        >
          <ArrowLeft size={16} /> Home
        </button>

        <span style={{ color: 'var(--color-border)' }}>|</span>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Inventory Management / {activeModule}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-heading)', margin: 0 }}>
            {getModuleTitle(activeModule)}
          </h2>
        </div>
      </div>

      {/* Right: Actions & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          <ShieldCheck size={14} /> 0% Stock Drift Guaranteed
        </div>

        <button 
          className="btn-pill-action"
          onClick={onReturnHome}
          style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-heading)', border: '1px solid var(--color-border)' }}
        >
          Landing Page
        </button>
      </div>
    </header>
  );
}
