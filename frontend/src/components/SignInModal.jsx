import React, { useState } from 'react';
import { api, setAuthToken } from '../api';
import { LogIn, X, ShieldCheck } from 'lucide-react';

export default function SignInModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('admin@stocksense.io');
  const [password, setPassword] = useState('Password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.access_token) {
        setAuthToken(res.access_token);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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
      <div className="odoo-card" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn color="var(--color-primary)" size={22} /> Sign In to StockSense
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-text-body)" />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              required
              className="odoo-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              required
              className="odoo-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#15803D', backgroundColor: '#DCFCE7', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Demo Manager Credentials Auto-Filled
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn-odoo-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-odoo-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
