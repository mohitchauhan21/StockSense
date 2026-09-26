import React, { useState } from 'react';
import HeaderNav from './components/HeaderNav';
import OdooHero from './components/OdooHero';
import AppGridLauncher from './components/AppGridLauncher';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import ReceiptsView from './components/ReceiptsView';
import DeliveriesView from './components/DeliveriesView';
import TransfersView from './components/TransfersView';
import AdjustmentsView from './components/AdjustmentsView';
import LedgerView from './components/LedgerView';
import WarehousesView from './components/WarehousesView';
import TestimonialSection from './components/TestimonialSection';
import FloatingHelpModal from './components/FloatingHelpModal';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const scrollToModuleSection = () => {
    const el = document.getElementById('active-module-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectModule = (modId) => {
    setActiveModule(modId);
    if (modId !== 'hero') {
      setTimeout(scrollToModuleSection, 50);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 5.1 Top Navigation Bar */}
      <HeaderNav 
        activeModule={activeModule} 
        onSelectModule={handleSelectModule} 
      />

      {/* 5.2 & 5.3 Odoo Hero Section */}
      <OdooHero 
        onStart={() => handleSelectModule('dashboard')} 
      />

      {/* 5.4 & 5.5 App Launcher Grid (6 Columns Duo-Tone Tiles) */}
      <AppGridLauncher 
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        showLowStockOnly={showLowStockOnly}
        onToggleLowStock={setShowLowStockOnly}
      />

      {/* Active Module View Console Container */}
      <div id="active-module-view" style={{ minHeight: '500px', backgroundColor: 'var(--color-bg-white)' }}>
        {activeModule === 'dashboard' && (
          <DashboardView onSelectModule={handleSelectModule} showLowStockOnly={showLowStockOnly} />
        )}

        {activeModule === 'products' && (
          <ProductsView showLowStockOnly={showLowStockOnly} />
        )}

        {activeModule === 'receipts' && (
          <ReceiptsView />
        )}

        {activeModule === 'deliveries' && (
          <DeliveriesView />
        )}

        {activeModule === 'transfers' && (
          <TransfersView />
        )}

        {activeModule === 'adjustments' && (
          <AdjustmentsView />
        )}

        {activeModule === 'ledger' && (
          <LedgerView />
        )}

        {activeModule === 'warehouses' && (
          <WarehousesView />
        )}
      </div>

      {/* 5.6, 5.7, 5.8 Statement, Testimonial & Closing Headline */}
      <TestimonialSection 
        onStart={() => handleSelectModule('dashboard')} 
      />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1B1B2F',
        color: '#A0A0B0',
        padding: '32px 24px',
        textAlign: 'center',
        fontSize: '14px',
        borderTop: '1px solid #2B2B3F'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '16px' }}>StockSense</span>
            <span>— Odoo Hiring Hackathon 2026</span>
          </div>
          <div>
            Modeled after Odoo marketing design system • Powered by FastAPI & PostgreSQL
          </div>
        </div>
      </footer>

      {/* 5.9 Floating Action Button Chat */}
      <FloatingHelpModal />

    </div>
  );
}
