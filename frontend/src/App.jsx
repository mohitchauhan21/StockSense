import React, { useState } from 'react';
import HeaderNav from './components/HeaderNav';
import OdooHero from './components/OdooHero';
import SidebarNav from './components/SidebarNav';
import AppHeader from './components/AppHeader';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import ReceiptsView from './components/ReceiptsView';
import DeliveriesView from './components/DeliveriesView';
import TransfersView from './components/TransfersView';
import AdjustmentsView from './components/AdjustmentsView';
import LedgerView from './components/LedgerView';
import WarehousesView from './components/WarehousesView';
import CategoriesView from './components/CategoriesView';
import TestimonialSection from './components/TestimonialSection';
import FloatingHelpModal from './components/FloatingHelpModal';
import SignInModal from './components/SignInModal';
import AdvisorModal from './components/AdvisorModal';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'app'
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  const handleLaunchApp = (modId = 'dashboard') => {
    setActiveModule(modId);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnHome = () => {
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render 1: Multipage Workspace Mode with Fixed Sidebar
  if (viewMode === 'app') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* Fixed Left Sidebar Navigation */}
        <SidebarNav
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          onReturnHome={handleReturnHome}
        />

        {/* Workspace Main Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
          {/* Top App Header */}
          <AppHeader
            activeModule={activeModule}
            onReturnHome={handleReturnHome}
          />

          {/* Module View Content */}
          <main style={{ flex: 1, paddingBottom: '60px' }}>
            {activeModule === 'dashboard' && (
              <DashboardView onSelectModule={(mod) => setActiveModule(mod)} showLowStockOnly={showLowStockOnly} />
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

            {activeModule === 'categories' && (
              <CategoriesView />
            )}
          </main>

          {/* Modals */}
          <SignInModal
            isOpen={isSignInOpen}
            onClose={() => setIsSignInOpen(false)}
            onSuccess={() => handleLaunchApp('dashboard')}
          />

          <AdvisorModal
            isOpen={isAdvisorOpen}
            onClose={() => setIsAdvisorOpen(false)}
          />

          {/* Floating Action Help Chat */}
          <FloatingHelpModal />
        </div>
      </div>
    );
  }

  // Render 2: Landing Page Mode (Marketing & Overview)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      
      {/* Top Sticky Navigation */}
      <HeaderNav 
        activeModule={activeModule} 
        onSelectModule={(mod) => handleLaunchApp(mod === 'hero' ? 'dashboard' : mod)} 
        onOpenSignIn={() => setIsSignInOpen(true)}
      />

      {/* Hero Display Section */}
      <OdooHero 
        onStart={() => handleLaunchApp('dashboard')} 
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Features Showcase Cards Section */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--color-bg-light)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
            StockSense Core Capabilities
          </h2>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '40px' }}>
            Double-Entry Stock Rules • Real-Time Auditing
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-primary)', textAlign: 'left' }}>
              <h3 className="heading-md" style={{ marginBottom: '8px' }}>Single Atomic Function</h3>
              <p className="body-text" style={{ fontSize: '14px' }}>
                Every stock mutation is strictly routed through update_stock() in Python, enforcing immutable double-entry constraints.
              </p>
              <button className="btn-odoo-secondary" onClick={() => handleLaunchApp('ledger')} style={{ marginTop: '16px', fontSize: '13px', padding: '6px 14px' }}>
                Explore Ledger →
              </button>
            </div>

            <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-accent-teal)', textAlign: 'left' }}>
              <h3 className="heading-md" style={{ marginBottom: '8px' }}>Reorder Point Alerts</h3>
              <p className="body-text" style={{ fontSize: '14px' }}>
                Automated minimum stock alerts warn managers before inventory dips below critical thresholds.
              </p>
              <button className="btn-odoo-secondary" onClick={() => handleLaunchApp('products')} style={{ marginTop: '16px', fontSize: '13px', padding: '6px 14px' }}>
                View Catalog →
              </button>
            </div>

            <div className="odoo-card" style={{ borderLeft: '4px solid var(--color-accent-orange)', textAlign: 'left' }}>
              <h3 className="heading-md" style={{ marginBottom: '8px' }}>Multi-Warehouse Operations</h3>
              <p className="body-text" style={{ fontSize: '14px' }}>
                Manage receipts, customer deliveries, internal transfers, and physical audit adjustments in one place.
              </p>
              <button className="btn-odoo-secondary" onClick={() => handleLaunchApp('warehouses')} style={{ marginTop: '16px', fontSize: '13px', padding: '6px 14px' }}>
                View Warehouses →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Closing Handwritten Statement */}
      <TestimonialSection 
        onStart={() => handleLaunchApp('dashboard')} 
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

      {/* Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={() => handleLaunchApp('dashboard')}
      />

      <AdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />

      {/* Floating Action Button Chat */}
      <FloatingHelpModal />

    </div>
  );
}
