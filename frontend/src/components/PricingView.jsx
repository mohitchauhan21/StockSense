import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Building2 } from 'lucide-react';

export default function PricingView({ onLaunchApp }) {
  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: '$49',
      period: '/month',
      desc: 'Essential double-entry stock tracking for single-location operations.',
      highlight: false,
      features: [
        'Up to 2 warehouse locations',
        'Up to 2,500 SKU catalog items',
        'Incoming receipts & outgoing deliveries',
        'Automated reorder point alerts',
        'CSV export of transaction logs',
        'Standard email support'
      ]
    },
    {
      name: 'Professional',
      icon: ShieldCheck,
      price: '$149',
      period: '/month',
      desc: 'Complete multi-warehouse logistics with real-time audit ledger verification.',
      highlight: true,
      features: [
        'Unlimited warehouse locations & bins',
        'Unlimited product catalog & SKUs',
        'Inter-warehouse transfer validations',
        'Physical count adjustment audits',
        'Immutable double-entry move ledger',
        'Real-time valuation analytics dashboard',
        'Role-based permissions (Manager & Staff)',
        'Priority technical support'
      ]
    },
    {
      name: 'Enterprise',
      icon: Building2,
      price: 'Custom',
      period: '',
      desc: 'High-volume logistics, dedicated infrastructure, and tailored integrations.',
      highlight: false,
      features: [
        'High-throughput async transaction processing',
        'Dedicated database instance & VPC peering',
        'Custom ERP & accounting integrations',
        'Custom retention policies & audit exports',
        'Dedicated technical account manager',
        '99.99% uptime SLA'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p className="section-eyebrow">
          Transparent Pricing
        </p>
        <h2 className="section-headline" style={{ fontSize: '34px', marginBottom: '14px' }}>
          Predictable pricing for precise inventory control
        </h2>
        <p className="body-text" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '16px' }}>
          Choose the tier that matches your distribution volume. All plans include mathematical double-entry guarantees.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'stretch',
        marginBottom: '64px'
      }}>
        {plans.map((p) => {
          const IconComp = p.icon;
          return (
            <div
              key={p.name}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: p.highlight ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: p.highlight 
                  ? '0 12px 32px rgba(37, 99, 235, 0.12)' 
                  : '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              {p.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '-13px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: p.highlight ? 'var(--color-accent-subtle)' : 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={20} color={p.highlight ? 'var(--color-accent)' : 'var(--color-text-body)'} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-heading)' }}>
                  {p.name}
                </h3>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--color-text-body)', minHeight: '40px', marginBottom: '20px' }}>
                {p.desc}
              </p>

              <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-text-heading)' }}>
                  {p.price}
                </span>
                {p.period && (
                  <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    {p.period}
                  </span>
                )}
              </div>

              <button
                className={p.highlight ? 'btn-primary' : 'btn-secondary'}
                onClick={onLaunchApp}
                style={{ width: '100%', marginBottom: '32px', padding: '12px' }}
              >
                Launch App <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '14px' }}>
                  What's included:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {p.features.map((feat) => (
                    <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--color-text-body)' }}>
                      <Check size={16} color="var(--color-status-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
