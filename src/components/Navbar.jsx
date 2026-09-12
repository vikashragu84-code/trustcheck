import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

export default function Navbar({ currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page, targetId) => {
    setIsOpen(false);
    onNavigate(page, targetId);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border py-4' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <ShieldCheck className="w-8 h-8 text-cyber-secondary group-hover:text-cyber-accent transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyber-primary/20 blur-sm rounded-full -z-10 group-hover:bg-cyber-secondary/30 transition-all duration-300" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Trust<span className="text-cyber-secondary">Check</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleNavClick('landing', 'how-it-works')}
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-glow transition-all duration-200 cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleNavClick('landing', 'features')}
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-glow transition-all duration-200 cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => handleNavClick('landing', 'pricing')}
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-glow transition-all duration-200 cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => handleNavClick('landing', 'faq')}
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-glow transition-all duration-200 cursor-pointer"
            >
              FAQ
            </button>

            {user && (
              <button 
                onClick={() => handleNavClick('history')}
                className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === 'history' ? 'text-cyber-secondary font-bold' : 'text-slate-300 hover:text-white hover:text-glow'
                }`}
              >
                My History
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => handleNavClick('scanner')}
              className="relative group overflow-hidden px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-cyber-primary hover:bg-blue-500 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_0_rgba(37,99,235,0.6)] cursor-pointer"
            >
              <span className="relative z-10">Run Analysis</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
            </button>

            {user ? (
              <UserMenu onNavigate={onNavigate} />
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 border border-cyber-border hover:border-cyber-secondary/50 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-cyber-secondary" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && <UserMenu onNavigate={onNavigate} />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 top-[72px] bg-cyber-bg/95 backdrop-blur-lg z-40 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } border-t border-cyber-border`}>
        <div className="px-4 pt-6 pb-8 space-y-6 flex flex-col items-center">
          <button 
            onClick={() => handleNavClick('landing', 'how-it-works')}
            className="w-full text-center py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleNavClick('landing', 'features')}
            className="w-full text-center py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('landing', 'pricing')}
            className="w-full text-center py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => handleNavClick('landing', 'faq')}
            className="w-full text-center py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors"
          >
            FAQ
          </button>

          {user && (
            <button 
              onClick={() => handleNavClick('history')}
              className="w-full text-center py-3 text-lg font-medium text-cyber-secondary hover:text-white transition-colors"
            >
              My Scan History
            </button>
          )}
          
          <div className="w-full h-px bg-cyber-border my-2" />

          {!user && (
            <button
              onClick={() => {
                setIsOpen(false);
                openAuthModal('signin');
              }}
              className="w-full py-3 px-6 text-center text-slate-200 bg-slate-900 border border-cyber-border rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-cyber-secondary" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
          
          <button 
            onClick={() => handleNavClick('scanner')}
            className="w-full py-3.5 px-6 text-center text-white bg-cyber-primary rounded-xl font-semibold shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]"
          >
            Run Analysis
          </button>
        </div>
      </div>
    </nav>
  );
}

