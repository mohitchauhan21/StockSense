import React from 'react';
import { Layers } from 'lucide-react';

export default function HeaderNav({ activeModule, onSelectModule, onOpenSignIn }) {
  return (
    <header style={{
      height: '68px',
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
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
          }}>
            <Layers size={19} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-heading)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)'
          }}>
            StockSense
          </span>
        </a>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[
            { label: 'Modules', id: 'app-grid' },
            { label: 'Ledger', id: 'ledger' },
            { label: 'Pricing', id: 'pricing' },
            { label: 'Docs', id: 'docs' },
          ].map((item) => {
            const isCurrent = activeModule === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'app-grid') {
                    const el = document.getElementById('app-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onSelectModule(item.id);
                  }
                }}
                style={{
                  color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-body)',
                  fontWeight: isCurrent ? '600' : '500',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                  padding: '4px 0',
                  borderBottom: isCurrent ? '2px solid var(--color-accent)' : '2px solid transparent'
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.target.style.color = 'var(--color-text-heading)'; }}
                onMouseLeave={(e) => { if (!isCurrent) e.target.style.color = 'var(--color-text-body)'; }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Right Actions: Consolidated Primary CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSignIn || (() => onSelectModule('dashboard'))}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-body)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '6px 12px'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-text-heading)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--color-text-body)'}
        >
          Sign in
        </button>

        {/* Consolidated Primary CTA */}
        <button
          className="btn-primary"
          onClick={() => onSelectModule('dashboard')}
          style={{ padding: '8px 18px', fontSize: '14px' }}
        >
          Launch App
        </button>
      </div>
    </header>
  );
}
