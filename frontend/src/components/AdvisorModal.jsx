import React, { useState } from 'react';
import { UserCheck, X, Send, Sparkles } from 'lucide-react';

export default function AdvisorModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(27, 27, 47, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="odoo-card" style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck color="var(--color-primary)" size={22} /> Speak with an Inventory Advisor
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-text-body)" />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <Sparkles size={36} color="var(--color-accent-teal)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '6px' }}>Request Submitted!</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-body)' }}>An Odoo Inventory Specialist will reach out to schedule a custom walkthrough.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Full Name</label>
              <input
                type="text"
                required
                className="odoo-input"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Work Email</label>
              <input
                type="email"
                required
                className="odoo-input"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn-odoo-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-odoo-primary">
                <Send size={14} /> Request Demo Call
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
