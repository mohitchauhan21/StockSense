import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function FloatingHelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hi there! I am StockSense AI Assistant. How can I help with your inventory double-entry rules or warehouse setup today?'
    }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const userMsg = inputMsg;
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Got it! StockSense processes all movements through update_stock() to ensure 0% stock drift. Try clicking on "Move History" in the top launcher to verify your transactions!`
        }
      ]);
    }, 600);
  };

  return (
    <>
      {/* FAB Button */}
      <button 
        className="fab-chat"
        onClick={() => setIsOpen(!isOpen)}
        title="StockSense Live Support & AI Chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Floating Chat Box Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '92px',
          right: '24px',
          width: '360px',
          height: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 16px 40px rgba(91, 42, 94, 0.25)',
          border: '1px solid var(--color-border)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} color="#FFFFFF" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700' }}>StockSense Support</h4>
                <p style={{ fontSize: '11px', opacity: 0.85 }}>Online • Operations Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Message Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#F8FAFC'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: m.sender === 'user' ? 'var(--color-primary)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--color-text-heading)',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--color-border)'
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="text"
              className="odoo-input"
              placeholder="Ask a question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
            <button
              type="submit"
              className="btn-pill-action"
              style={{ padding: '8px 12px', borderRadius: '10px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
