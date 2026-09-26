import React from 'react';

export default function HeaderNav({ activeModule, onSelectModule, onOpenSignIn }) {
  return (
    <header style={{
      height: '72px',
      backgroundColor: 'var(--color-bg-white)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between',
    }}>
      {/* Left: Brand Logo & Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onSelectModule('hero'); }} 
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #8A3D8F 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '18px',
            boxShadow: '0 4px 10px rgba(91, 42, 94, 0.25)'
          }}>
            S
          </div>
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)'
          }}>
            StockSense<span style={{ color: 'var(--color-accent-orange)' }}>.</span>
          </span>
        </a>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[
            { label: 'Apps', action: () => onSelectModule('dashboard') },
            { label: 'Modules', action: () => onSelectModule('products') },
            { label: 'Ledger', action: () => onSelectModule('ledger') },
            { label: 'Warehouses', action: () => onSelectModule('warehouses') },
            { label: 'Docs', action: () => window.open('/docs', '_blank') },
          ].map((item) => (
            <a
              key={item.label}
              href={`#${item.label.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              style={{
                color: 'var(--color-text-body)',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-text-heading)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-text-body)'}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSignIn}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-body)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '6px 12px'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--color-text-body)'}
        >
          Sign in
        </button>

        {/* CTA Button with Live Sync Indicator Dot */}
        <button
          className="btn-pill-action"
          onClick={() => onSelectModule('dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4ADE80',
            boxShadow: '0 0 8px #4ADE80',
            display: 'inline-block'
          }}></span>
          Launch Inventory App
        </button>
      </div>
    </header>
  );
}
