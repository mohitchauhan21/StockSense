import React, { useState } from 'react';
import HeaderNav from './components/HeaderNav';
import HeroSection from './components/HeroSection';
import SidebarNav from './components/SidebarNav';
import AppHeader from './components/AppHeader';
import AppGridLauncher from './components/AppGridLauncher';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import ReceiptsView from './components/ReceiptsView';
import DeliveriesView from './components/DeliveriesView';
import TransfersView from './components/TransfersView';
import AdjustmentsView from './components/AdjustmentsView';
import LedgerView from './components/LedgerView';
import WarehousesView from './components/WarehousesView';
import CategoriesView from './components/CategoriesView';
import PricingView from './components/PricingView';
import DocsEntryView from './components/DocsEntryView';
import AboutView from './components/AboutView';
import TestimonialSection from './components/TestimonialSection';
import FloatingHelpModal from './components/FloatingHelpModal';
import SignInModal from './components/SignInModal';
import AdvisorModal from './components/AdvisorModal';
import { Layers, ArrowRight } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'app'
  const [activeModule, setActiveModule] = useState('dashboard');
  const [landingSection, setLandingSection] = useState('default'); // 'default' | 'pricing' | 'docs' | 'about'
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
    setLandingSection('default');
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

            {activeModule === 'pricing' && (
              <PricingView onLaunchApp={() => handleLaunchApp('dashboard')} />
            )}

            {activeModule === 'docs' && (
              <DocsEntryView onLaunchApp={() => handleLaunchApp('dashboard')} />
            )}

            {activeModule === 'about' && (
              <AboutView onLaunchApp={() => handleLaunchApp('dashboard')} />
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

  // Render 2: Landing Page Mode (Clean SaaS Visual Identity)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-white)' }}>
      
      {/* Top Navigation Bar */}
      <HeaderNav 
        activeModule={landingSection !== 'default' ? landingSection : activeModule} 
        onSelectModule={(target) => {
          if (target === 'pricing' || target === 'docs' || target === 'about') {
            setLandingSection(target);
            setTimeout(() => {
              const el = document.getElementById('marketing-subview');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          } else if (target === 'hero') {
            setLandingSection('default');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            handleLaunchApp(target === 'app-grid' ? 'dashboard' : target);
          }
        }} 
        onOpenSignIn={() => setIsSignInOpen(true)}
      />

      {/* Hero Display Section */}
      <HeroSection 
        onStart={() => handleLaunchApp('dashboard')} 
        onDocs={() => {
          setLandingSection('docs');
          setTimeout(() => {
            const el = document.getElementById('marketing-subview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Balanced 4x2 App Launcher Grid */}
      <AppGridLauncher 
        activeModule={activeModule}
        onSelectModule={(modId) => handleLaunchApp(modId)}
        showLowStockOnly={showLowStockOnly}
        onToggleLowStock={setShowLowStockOnly}
      />

      {/* Marketing Subview (Pricing, Docs, About, or Testimonial) */}
      <div id="marketing-subview">
        {landingSection === 'pricing' && (
          <PricingView onLaunchApp={() => handleLaunchApp('dashboard')} />
        )}

        {landingSection === 'docs' && (
          <DocsEntryView onLaunchApp={() => handleLaunchApp('dashboard')} />
        )}

        {landingSection === 'about' && (
          <AboutView onLaunchApp={() => handleLaunchApp('dashboard')} />
        )}
      </div>

      {/* Testimonial & System Statement */}
      <TestimonialSection 
        onStart={() => handleLaunchApp('dashboard')} 
      />

      {/* Clean Enterprise SaaS Footer */}
      <footer style={{
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        padding: '56px 24px 36px',
        borderTop: '1px solid #1E293B',
        fontSize: '14px'
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '32px',
            paddingBottom: '40px',
            borderBottom: '1px solid #1E293B'
          }}>
            {/* Brand Block */}
            <div style={{ maxWidth: '340px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Layers size={18} color="#FFFFFF" strokeWidth={2.2} />
                </div>
                <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '18px', letterSpacing: '-0.02em' }}>
                  StockSense
                </span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13.5px', lineHeight: '1.6' }}>
                Enterprise inventory control and immutable double-entry ledger verification. 
                Zero stock drift across multi-facility warehouse networks.
              </p>
            </div>

            {/* Nav Links Column */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '13.5px', marginBottom: '14px' }}>
                  Platform
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                  <li>
                    <a 
                      href="#dashboard" 
                      onClick={(e) => { e.preventDefault(); handleLaunchApp('dashboard'); }}
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      Operations Console
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#ledger" 
                      onClick={(e) => { e.preventDefault(); handleLaunchApp('ledger'); }}
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      Move History Ledger
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#pricing" 
                      onClick={(e) => {
                        e.preventDefault();
                        setLandingSection('pricing');
                        const el = document.getElementById('marketing-subview');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      Pricing Plans
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '13.5px', marginBottom: '14px' }}>
                  Resources
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                  <li>
                    <a 
                      href="#docs" 
                      onClick={(e) => {
                        e.preventDefault();
                        setLandingSection('docs');
                        const el = document.getElementById('marketing-subview');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/docs" 
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      API Reference (OpenAPI)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#about" 
                      onClick={(e) => {
                        e.preventDefault();
                        setLandingSection('about');
                        const el = document.getElementById('marketing-subview');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ color: '#94A3B8', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                      onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                    >
                      About & Changelog
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Consolidated Primary CTA in Footer */}
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '13.5px', marginBottom: '14px' }}>
                Get Started
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '14px', maxWidth: '240px' }}>
                Open the operational console to manage inventory in real time.
              </p>
              <button
                className="btn-primary"
                onClick={() => handleLaunchApp('dashboard')}
                style={{ padding: '10px 22px', fontSize: '14px' }}
              >
                Launch App <ArrowRight size={15} />
              </button>
            </div>

          </div>

          {/* Bottom Copyright & Legal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            fontSize: '12.5px',
            color: '#64748B',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              © 2026 StockSense Systems Inc. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Security</span>
            </div>
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

      {/* Floating Action Button Support */}
      <FloatingHelpModal />

    </div>
  );
}
