import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyber-secondary/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Copy (Left 7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-accent text-xs font-semibold uppercase tracking-wider animate-pulse-glow">
              <ShieldCheck className="w-4 h-4 text-cyber-secondary" />
              <span>AI-Powered Risk Analysis</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              Check Before <br />
              You <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-secondary via-cyber-accent to-blue-400 text-glow">Trust.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Analyze suspicious messages, SMS, links, and screenshots for potential scam warning signs before you click, reply, or share credentials.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => onNavigate('scanner')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyber-primary hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_-3px_rgba(37,99,235,0.45)] hover:shadow-[0_0_30px_-2px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span>Check Something Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('landing', 'how-it-works')}
                className="w-full sm:w-auto bg-slate-800/60 hover:bg-slate-800 border border-cyber-border text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Sample Risk Card Display (Right 5 Cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="glass-panel rounded-2xl p-6 glow-red border-red-500/20 relative overflow-hidden max-w-md mx-auto w-full">
              {/* Scan simulation overlay */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-danger/60 animate-scan-line shadow-[0_0_10px_2px_rgba(239,68,68,0.5)]" />
              
              <div className="flex justify-between items-start mb-4 border-b border-cyber-border/60 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Incoming Message Sample</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono truncate">"+1 (833) 293-8472"</div>
                </div>
                <div className="flex items-center gap-1.5 bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger text-xs font-semibold px-2.5 py-1 rounded-md">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>High Risk Indicators</span>
                </div>
              </div>

              {/* Message Content Bubble */}
              <div className="bg-slate-900/60 border border-cyber-border rounded-xl p-3 text-sm text-slate-300 mb-5 leading-normal italic font-sans">
                "Your Chase bank account has been flagged for unauthorized access and will be blocked today. Click immediately to verify your credentials: <span className="text-cyber-accent underline break-all">http://chase-secure-profile.com</span>"
              </div>

              {/* Risk Dial & Details */}
              <div className="flex items-center gap-5 bg-cyber-danger/5 border border-cyber-danger/10 rounded-xl p-4 mb-4">
                <div className="relative flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-4 border-cyber-danger/25">
                  {/* Circular Arc Glow */}
                  <div className="absolute inset-0 rounded-full border-t-4 border-cyber-danger animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="font-extrabold text-xl text-cyber-danger text-glow-red">87</span>
                  <span className="text-[10px] text-cyber-danger absolute bottom-2 font-semibold">/100</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase font-bold text-slate-400">Analysis Rating</h4>
                  <p className="text-base font-bold text-white leading-none">Scam Match: 87%</p>
                  <p className="text-xs text-cyber-danger font-medium">Critical warning patterns matched</p>
                </div>
              </div>

              {/* Warnings List */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-cyber-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Creates artificial urgency</span>
                    <span className="text-slate-400"> (threat of blocking within the same day)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-cyber-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Requests sensitive credentials</span>
                    <span className="text-slate-400"> (link redirects to login update request)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-cyber-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Suspicious URL mismatch</span>
                    <span className="text-slate-400"> (uses unauthorized insecure domains)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-disclaimer */}
            <p className="text-center text-[11px] text-slate-500 mt-4 max-w-sm mx-auto leading-relaxed">
              * TrustCheck provides automated risk evaluations using scan heuristics. This represents an educational analysis, not a legal or functional guarantee.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
