import React from 'react';
import { 
  BarChart3, 
  Package, 
  Download, 
  Truck, 
  ArrowLeftRight, 
  Sliders, 
  BookOpen, 
  Warehouse,
  FolderTree,
  Home,
  LogOut,
  UserCheck
} from 'lucide-react';

export const SIDEBAR_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: 'Live' },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'receipts', label: 'Receipts (GRN)', icon: Download },
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
  { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
  { id: 'adjustments', label: 'Adjustments', icon: Sliders },
  { id: 'ledger', label: 'Move History', icon: BookOpen, badge: 'Audit' },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { id: 'categories', label: 'Categories', icon: FolderTree },
];

export default function SidebarNav({ activeModule, onSelectModule, onReturnHome }) {
  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#1B1B2F',
      color: '#FFFFFF',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: '1px solid #2C2C44',
      zIndex: 150,
      flexShrink: 0
    }}>
      {/* Top Branding Header */}
      <div>
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #2C2C44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '17px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              S
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                StockSense
              </span>
              <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Operations Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <button
            onClick={onReturnHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              color: '#A0A0B0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              marginBottom: '8px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A0A0B0'; }}
          >
            <Home size={18} />
            <span>Website Home</span>
          </button>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B6B80', fontWeight: '700', letterSpacing: '0.08em', padding: '8px 14px 4px' }}>
            Modules & Apps
          </div>

          {SIDEBAR_MODULES.map((mod) => {
            const IconComponent = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #60A5FA' : '3px solid transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(30, 58, 138, 0.35)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#CBD5E1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconComponent size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                  <span>{mod.label}</span>
                </div>
                {mod.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(37, 99, 235, 0.25)',
                    color: isActive ? '#FFFFFF' : '#93C5FD',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #2C2C44',
        backgroundColor: '#151525',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            SA
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>System Admin</div>
            <div style={{ fontSize: '11px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={10} /> Active Manager
            </div>
          </div>
        </div>

        <button 
          onClick={onReturnHome}
          title="Return to Landing Page"
          style={{ background: 'none', border: 'none', color: '#A0A0B0', cursor: 'pointer', padding: '4px' }}
        >
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
}
