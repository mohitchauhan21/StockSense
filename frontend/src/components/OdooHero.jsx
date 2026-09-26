import React from 'react';

export default function OdooHero({ onStart, onOpenAdvisor }) {
  return (
    <section style={{
      padding: '56px 24px 72px',
      backgroundColor: 'var(--color-bg-white)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 5.3 Announcement / Info Pill */}
      <div className="announcement-pill">
        <span style={{ fontSize: '18px' }}>🇮🇳</span>
        <span className="pill-badge">StockSense 1.0 Release:</span>
        <span style={{ color: 'var(--color-text-body)' }}>Double-Entry Ledger & Double-Audit Rules Active</span>
        <a 
          href="#dashboard" 
          className="pill-link"
          onClick={(e) => { e.preventDefault(); onStart(); }}
        >
          Explore Live App →
        </a>
      </div>

      {/* 5.2 Hero Display Headline */}
      <div style={{ maxWidth: '900px', margin: '0 auto 20px' }}>
        <h1 className="handwritten-hero">
          All your inventory on <mark className="marker-orange">one platform.</mark>
          <br />
          Simple, efficient, yet <span className="underline-teal">auditable!</span>
        </h1>
      </div>

      {/* Sub-headline */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '18px',
        color: 'var(--color-text-body)',
        maxWidth: '640px',
        margin: '0 auto 36px',
        lineHeight: 1.6
      }}>
        Real-time double-entry stock tracking, zero stock drift, automated reorder points, 
        and an immutable move ledger — designed for modern teams.
      </p>

      {/* CTA Buttons & Annotation Callout */}
      <div style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        <button className="btn-odoo-primary" onClick={onStart}>
          Start now - It's free
        </button>

        <button className="btn-odoo-secondary" onClick={onOpenAdvisor}>
          Meet an advisor
        </button>

        {/* Hand-drawn Annotation + Curved Arrow */}
        <div style={{
          position: 'absolute',
          right: '-210px',
          top: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }} className="desktop-only">
          {/* SVG Arrow */}
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8C14 2 30 4 40 24M40 24L32 20M40 24L44 14" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="handwritten-annotation">
            80/80 Backend Tests<br />Verified Live!
          </span>
        </div>
      </div>
    </section>
  );
}
