import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cyber-bg border-t border-cyber-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <ShieldCheck className="w-6 h-6 text-cyber-secondary" />
              <span className="font-bold text-lg text-white">TrustCheck</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering users to analyze messages, suspicious links, and screenshots to identify scam patterns and protect their online identity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate('landing', 'how-it-works')}
                  className="text-sm text-slate-400 hover:text-white hover:text-glow transition-all"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('landing', 'features')}
                  className="text-sm text-slate-400 hover:text-white hover:text-glow transition-all"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('landing', 'faq')}
                  className="text-sm text-slate-400 hover:text-white hover:text-glow transition-all"
                >
                  FAQ Help Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy" 
                  onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} 
                  className="text-sm text-slate-400 hover:text-white hover:text-glow transition-all"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service are mock for this demo.'); }} className="text-sm text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#disclaimer" onClick={(e) => { e.preventDefault(); alert('Disclaimer details: TrustCheck is for educational risk assessment purposes.'); }} className="text-sm text-slate-400 hover:text-white transition-colors">
                  Disclaimers
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Contact: reach us at contact@trustcheck-demo.com'); }} className="text-sm text-slate-400 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyber-border/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {currentYear} TrustCheck. All rights reserved. Built as a high-fidelity educational demonstration.
          </p>
          <div className="max-w-xl text-center md:text-right">
            <p className="text-[11px] text-slate-500 leading-normal">
              <span className="text-slate-400 font-medium">Educational Disclaimer:</span> TrustCheck provides automated risk evaluations based on public heuristics. It does not warrant or guarantee absolute security safety, nor does it officially certify safe/fraudulent contents. Always verify transactional queries directly through authorized communication channels.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
