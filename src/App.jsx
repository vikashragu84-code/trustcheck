import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Scanner from './components/Scanner';
import ResultReport from './components/ResultReport';
import ScanHistory from './components/ScanHistory';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UpgradeModal from './components/UpgradeModal';
import LimitModal from './components/LimitModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'scanner' | 'result' | 'history'
  const [scanResult, setScanResult] = useState(null);

  // Scroll handler for targeting page IDs on the landing view
  const handleNavigate = (page, targetId = null) => {
    if (page === 'landing') {
      setCurrentPage('landing');
      setScanResult(null);
      
      if (targetId) {
        // Wait for page transition rendering to scroll
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (page === 'scanner') {
      setCurrentPage('scanner');
      setScanResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'history') {
      setCurrentPage('history');
      setScanResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScanComplete = (result) => {
    setScanResult(result);
    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetScan = () => {
    setScanResult(null);
    setCurrentPage('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top on direct scanner transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans antialiased">
      {/* Sticky Header */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Pages */}
      <main className="flex-grow">
        {currentPage === 'landing' && (
          <div className="animate-fadeIn">
            <Hero onNavigate={handleNavigate} />
            <HowItWorks />
            <Features />
            <Pricing />
            <FAQ />
          </div>
        )}

        {currentPage === 'scanner' && (
          <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
              <span className="text-xs uppercase font-extrabold text-cyber-secondary tracking-widest text-glow">
                Educational Scam Warning Scanner
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                Input Risk Assessment Portal
              </h2>
              <p className="text-sm text-slate-400">
                Paste messages, paste links, or select a screenshot preset to evaluate threat patterns.
              </p>
            </div>
            <Scanner onScanComplete={handleScanComplete} />
          </section>
        )}

        {currentPage === 'result' && scanResult && (
          <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
              <span className="text-xs uppercase font-extrabold text-cyber-secondary tracking-widest text-glow">
                Evaluation Report
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                TrustCheck Scam Risk Assessment
              </h2>
              <p className="text-sm text-slate-400">
                Automated indicators compiled below. Review checklist before making action decisions.
              </p>
            </div>
            <ResultReport result={scanResult} onReset={handleResetScan} />
          </section>
        )}

        {currentPage === 'history' && (
          <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <ScanHistory onNavigate={handleNavigate} />
          </section>
        )}
      </main>

      {/* Bottom Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal Overlay */}
      <AuthModal />

      {/* Upgrade Modal Overlay */}
      <UpgradeModal />

      {/* Premium Limit Modal Overlay */}
      <LimitModal />
    </div>
  );
}

