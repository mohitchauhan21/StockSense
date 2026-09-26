import React from 'react';

export default function TestimonialSection({ onStart }) {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-bg-white)', textAlign: 'center' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* 5.6 Statement + Body Text Block */}
        <div style={{ marginBottom: '64px', maxWidth: '720px', margin: '0 auto 64px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '12px', lineHeight: '1.3' }}>
            Imagine a vast collection of business apps at your disposal.
          </h3>
          <p className="body-text" style={{ fontSize: '17px', marginBottom: '24px' }}>
            Got something to improve? There is an app for that. No complexity, no cost, just a one-click install.
          </p>
          <p className="body-text" style={{ fontSize: '17px' }}>
            Each app simplifies a process and empowers more people. Imagine the impact when everyone gets the right tool for the job, 
            tailored with native double-entry ledger security.
          </p>
        </div>

        {/* 5.7 Testimonial / Callout Card with stacked paper effect */}
        <div style={{
          position: 'relative',
          maxWidth: '680px',
          margin: '0 auto 80px',
          padding: '20px'
        }}>
          {/* Stacked rotated orange card background */}
          <div style={{
            position: 'absolute',
            inset: '10px -10px -10px 10px',
            backgroundColor: 'var(--color-accent-orange)',
            borderRadius: '24px',
            transform: 'rotate(-2deg)',
            zIndex: 1
          }}></div>

          {/* Card Content */}
          <div className="odoo-card" style={{
            position: 'relative',
            zIndex: 2,
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'left',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Avatar + Speech Bubble */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {/* Comic Speech Bubble */}
              <div style={{
                position: 'absolute',
                top: '-28px',
                right: '-10px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #1B1B2F',
                borderRadius: '16px',
                padding: '4px 8px',
                fontSize: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                zIndex: 3
              }}>
                😊
              </div>
              
              {/* Avatar circle */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-teal) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '24px',
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}>
                BM
              </div>
            </div>

            {/* Quote Body */}
            <div>
              <blockquote style={{
                fontStyle: 'italic',
                fontSize: '18px',
                color: 'var(--color-text-heading)',
                marginBottom: '8px',
                lineHeight: '1.4'
              }}>
                "If you simplify everything, you can do anything!"
              </blockquote>
              <div style={{ fontSize: '13px', color: 'var(--color-text-body)', fontWeight: '500' }}>
                — Bill McDermott, former CEO of SAP & ServiceNow
              </div>
            </div>
          </div>
        </div>

        {/* 5.8 Section Closer Headline */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className="handwritten-hero">
            <span className="strikethrough-coral">Level up</span> your quality of <span className="underline-teal">work</span>
          </h2>
        </div>

        {/* Bottom CTA */}
        <div>
          <button className="btn-odoo-primary" onClick={onStart} style={{ padding: '16px 36px', fontSize: '18px' }}>
            Start now - It's free
          </button>
        </div>

      </div>
    </section>
  );
}
