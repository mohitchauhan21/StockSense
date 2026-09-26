import React from 'react';
import { BookOpen, Terminal, Code2, Database, Shield, ArrowRight, ExternalLink } from 'lucide-react';

export default function DocsEntryView({ onLaunchApp }) {
  const sections = [
    {
      title: 'Double-Entry Ledger Principles',
      icon: Shield,
      desc: 'Understand how StockSense treats inventory as double-entry debits and credits to completely eliminate stock drift.',
      bullets: [
        'Receipts credit source supplier and debit internal warehouse locations',
        'Deliveries credit internal stock and debit customer destination partner',
        'Transfers execute balanced simultaneous debit-credit pairs',
        'Immutable audit move log guarantees tamper-proof verification'
      ]
    },
    {
      title: 'REST API & Endpoints',
      icon: Code2,
      desc: 'Complete documentation for programmatic integration and ERP synchronization.',
      bullets: [
        'Interactive OpenAPI / Swagger UI live at /docs',
        'Comprehensive ReDoc reference available at /redoc',
        'JWT Bearer token authentication with role-based scoping',
        'Standardized JSON error schemas with detail validation'
      ]
    },
    {
      title: 'Data Models & Schemas',
      icon: Database,
      desc: 'Relational data architecture designed for high-concurrency stock operations.',
      bullets: [
        'Atomic stock_moves ledger table with historical tracking',
        'Indexed SKU catalog with unit-of-measure conversions',
        'Multi-facility warehouse and bin hierarchy',
        'Audit adjustment journals with justification tracking'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p className="section-eyebrow">
          Developer & Operator Documentation
        </p>
        <h2 className="section-headline" style={{ fontSize: '34px', marginBottom: '14px' }}>
          StockSense Technical Documentation
        </h2>
        <p className="body-text" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '16px' }}>
          Explore architecture guides, API references, and double-entry inventory specifications.
        </p>
      </div>

      {/* Quick Links Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="stock-card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s, transform 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div>
            <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '15px', marginBottom: '4px' }}>
              Interactive Swagger Docs
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Test live endpoints in your browser
            </div>
          </div>
          <ExternalLink size={18} color="var(--color-accent)" />
        </a>

        <a
          href="/redoc"
          target="_blank"
          rel="noreferrer"
          className="stock-card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s, transform 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div>
            <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '15px', marginBottom: '4px' }}>
              ReDoc API Reference
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Clean, three-panel API schema view
            </div>
          </div>
          <ExternalLink size={18} color="var(--color-accent)" />
        </a>
      </div>

      {/* Docs Topic Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div key={sec.title} className="stock-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={20} color="var(--color-accent)" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
                  {sec.title}
                </h3>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--color-text-body)', marginBottom: '18px', lineHeight: '1.5' }}>
                {sec.desc}
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sec.bullets.map((b) => (
                  <li key={b} style={{ fontSize: '13px', color: 'var(--color-text-body)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Consolidated CTA */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          className="btn-primary"
          onClick={onLaunchApp}
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          Launch App <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
