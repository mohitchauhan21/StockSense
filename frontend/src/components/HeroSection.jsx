import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function HeroSection({ onStart, onDocs }) {
  return (
    <section style={{
      padding: '72px 24px 72px',
      backgroundColor: 'var(--color-bg-white)',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Product Announcement Pill */}
      <div className="announcement-pill">
        <span className="pill-badge">Release 1.0</span>
        <span style={{ color: 'var(--color-text-body)' }}>
          Real-time multi-warehouse double-entry ledger active
        </span>
        <a 
          href="#app-grid-section" 
          className="pill-link"
          onClick={(e) => { e.preventDefault(); onStart(); }}
        >
          Explore Modules →
        </a>
      </div>

      {/* Main Headline (Clean Sans-Serif Inter, No Markers or Script Fonts) */}
      <div style={{ maxWidth: '860px', margin: '0 auto 20px' }}>
        <h1 className="hero-headline">
          Enterprise inventory control with{' '}
          <span style={{ color: 'var(--color-accent)' }}>immutable ledger</span> precision.
        </h1>
      </div>

      {/* Sub-headline */}
      <p className="hero-subhead" style={{ marginBottom: '36px' }}>
        Track stock movements across every warehouse with mathematically verified double-entry balances, 
        automated reorder thresholds, and zero stock drift.
      </p>

      {/* Consolidated CTAs: Primary "Launch App", At Most One Secondary CTA */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn-primary" 
          onClick={onStart}
          style={{ padding: '13px 28px', fontSize: '15px' }}
        >
          Launch App <ArrowRight size={16} />
        </button>

        <button 
          className="btn-secondary" 
          onClick={onDocs || onStart}
          style={{ padding: '13px 24px', fontSize: '15px' }}
        >
          <BookOpen size={16} color="var(--color-text-body)" />
          View Documentation
        </button>
      </div>
    </section>
  );
}
