import React from 'react';
import { Layers, Database, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutView({ onLaunchApp }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '56px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p className="section-eyebrow">
          System Overview & Specifications
        </p>
        <h2 className="section-headline" style={{ fontSize: '32px', marginBottom: '14px' }}>
          About StockSense Architecture
        </h2>
        <p className="body-text" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '16px' }}>
          StockSense was engineered as a modular, high-reliability inventory engine enforcing 
          strict double-entry bookkeeping on all warehouse stock operations.
        </p>
      </div>

      {/* Tech Specifications Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        <div className="stock-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
              Async REST Engine
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-body)', lineHeight: '1.5' }}>
            Built on asynchronous Python with FastAPI and Pydantic v2. Provides high-throughput non-blocking 
            I/O for multi-location warehouse operations.
          </p>
        </div>

        <div className="stock-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Database size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
              Relational Storage
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-body)', lineHeight: '1.5' }}>
            Powered by PostgreSQL with SQLAlchemy 2.0 and Alembic schema migrations. Enforces transactional 
            integrity and foreign-key constraints on every stock movement.
          </p>
        </div>

        <div className="stock-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CheckCircle2 size={20} color="var(--color-status-success)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
              Comprehensive Test Coverage
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-body)', lineHeight: '1.5' }}>
            Validated across 11 test phases covering authentication, product catalog, receipts, deliveries, 
            internal transfers, adjustments, and full lifecycle end-to-end flows.
          </p>
        </div>
      </div>

      {/* Changelog / Release History */}
      <div className="stock-card" style={{ marginBottom: '40px', padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '16px' }}>
          Release Notes & Changelog
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '14.5px' }}>
                Version 1.0.0 — Production Release
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                September 2026
              </span>
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-body)' }}>
              <li>• Native double-entry inventory ledger with immutable audit moves</li>
              <li>• Multi-warehouse management, internal transfers, and adjustment journals</li>
              <li>• Consolidated UI with live metrics and automated low-stock warnings</li>
              <li>• Role-based security with JWT and email OTP verification workflows</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
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
