import React from 'react';
import { ArrowRight, Quote, ShieldCheck } from 'lucide-react';

export default function TestimonialSection({ onStart }) {
  return (
    <section style={{ 
      padding: '88px 24px', 
      backgroundColor: 'var(--color-bg-white)', 
      textAlign: 'center',
      borderTop: '1px solid var(--color-border)'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Core Architecture Statement Block (Original Inventory/Ledger Copy) */}
        <div style={{ maxWidth: '740px', margin: '0 auto 64px' }}>
          <p className="section-eyebrow">
            Built for Audit Compliance
          </p>
          <h3 className="section-headline" style={{ marginBottom: '16px' }}>
            Engineered for high-volume warehouse accuracy and zero stock drift
          </h3>
          <p className="body-text" style={{ fontSize: '16px', marginBottom: '18px' }}>
            Traditional inventory software relies on periodic batch reconciliations that permit hidden drift. 
            StockSense enforces mathematical double-entry verification on every receipt, delivery, and transfer.
          </p>
          <p className="body-text" style={{ fontSize: '16px' }}>
            Every balance modification maps directly to a verified transaction record, guaranteeing 
            real-time inventory valuation and continuous audit readiness.
          </p>
        </div>

        {/* Clean Testimonial Card (Subtle Shadow, 1px Border, No Skewed Corners or Markers) */}
        <div className="clean-quote-card" style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Quote size={22} color="var(--color-accent)" />
            </div>

            <div style={{ flex: 1 }}>
              <blockquote style={{
                fontSize: '17px',
                fontWeight: '500',
                color: 'var(--color-text-heading)',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                "Implementing strict double-entry mechanics transformed our multi-facility inventory tracking. 
                Cycle count errors dropped to zero and our quarterly audit took hours instead of weeks."
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px'
                }}>
                  SC
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                    Supply Chain Director
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                    Enterprise Distribution Network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Closer Headline & Consolidated Primary CTA */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 className="section-headline" style={{ fontSize: '30px', marginBottom: '14px' }}>
            Ready to streamline your inventory operations?
          </h2>
          <p className="body-text" style={{ fontSize: '16px', marginBottom: '28px' }}>
            Gain complete visibility over stock levels, warehouse transfers, and ledger moves today.
          </p>

          <div>
            <button 
              className="btn-primary" 
              onClick={onStart}
              style={{ padding: '14px 32px', fontSize: '15.5px' }}
            >
              Launch App <ArrowRight size={17} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
