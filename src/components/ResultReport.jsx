import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  FileText,
  CheckCircle2,
  Sparkles,
  LockKeyhole,
  ArrowUpRight
} from 'lucide-react';

export default function ResultReport({ result, onReset }) {
  const score = Number(result?.score ?? 0);
  const level = result?.level || 'caution';
  const safeScore = Math.max(0, Math.min(100, score));

  // Defensive string conversion helper to prevent React object rendering errors
  const safeText = (value, fallback = '') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value && typeof value === 'object') {
      if (typeof value.text === 'string') return value.text;
      if (typeof value.description === 'string') return value.description;
      if (typeof value.title === 'string') return value.title;
      return fallback;
    }
    return fallback;
  };

  // Warning signs normalization
  const warningSigns = Array.isArray(result?.warningSigns)
    ? result.warningSigns
        .map((item) => {
          if (typeof item === 'string') {
            return { title: 'Suspicious Indicator', description: item };
          }
          if (item && typeof item === 'object') {
            return {
              title: safeText(item.title, 'Suspicious Indicator'),
              description: safeText(item.description, 'A suspicious pattern was identified.')
            };
          }
          return { title: 'Suspicious Indicator', description: 'A suspicious pattern was identified.' };
        })
        .filter(Boolean)
    : [];

  // Next steps normalization
  const nextSteps = Array.isArray(result?.nextSteps)
    ? result.nextSteps
        .map((step) => safeText(step, 'Follow standard online safety precautions.'))
        .filter(Boolean)
    : [];

  // Score count up animation
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (safeScore === 0) {
      setDisplayScore(0);
      return;
    }

    let start = 0;
    const duration = 800;
    const incrementTime = Math.max(10, Math.floor(duration / safeScore));

    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= safeScore) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [safeScore]);

  // Risk visual themes
  const themes = {
    low: {
      color: 'text-cyber-success',
      border: 'border-cyber-success/20',
      bg: 'bg-cyber-success/5',
      glow: 'glow-green',
      ring: 'stroke-cyber-success',
      title: 'Low Apparent Risk',
      icon: ShieldCheck
    },
    caution: {
      color: 'text-cyber-warning',
      border: 'border-cyber-warning/20',
      bg: 'bg-cyber-warning/5',
      glow: 'glow-yellow',
      ring: 'stroke-cyber-warning',
      title: 'Caution Advised',
      icon: AlertTriangle
    },
    high: {
      color: 'text-cyber-danger',
      border: 'border-cyber-danger/20',
      bg: 'bg-cyber-danger/5',
      glow: 'glow-red',
      ring: 'stroke-cyber-danger',
      title: 'High Risk Indicators',
      icon: ShieldAlert
    }
  };

  const theme = themes[level] || themes.caution;
  const RiskIcon = theme.icon;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const statusLevel = level === 'high' ? 'HIGH' : level === 'caution' ? 'CAUTION' : 'LOW';

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyber-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyber-secondary">
              TrustCheck Assessment
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Scam & Threat Analysis Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated threat signals compiled from the submitted content.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-cyber-border">
          <LockKeyhole className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            AUTOMATED EVALUATION
          </span>
        </div>
      </div>

      {/* DEMO MODE NOTICE (Shown ONLY when local fallback is used) */}
      {(result?.isDemo || result?.useDemo) && (
        <div className="glass-panel border border-cyber-warning/30 bg-cyber-warning/5 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-cyber-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-cyber-warning">Demo Mode:</span>{' '}
            The primary AI service was temporarily unavailable or unreachable. TrustCheck generated this analysis using its local threat heuristic fallback engine.
          </div>
        </div>
      )}

      {/* MAIN RISK CARD */}
      <div className={`glass-panel rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border ${theme.border} ${theme.glow}`}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyber-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyber-secondary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* SCORE DIAL */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-48 h-48">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <circle cx="80" cy="80" r="68" className="stroke-slate-800/50" strokeWidth="1" fill="transparent" />
              <circle cx="80" cy="80" r={radius} className="stroke-slate-800" strokeWidth="10" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={theme.ring}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-extrabold text-5xl sm:text-6xl ${theme.color} text-glow leading-none`}>
                {displayScore}
              </span>
              <span className="text-slate-500 text-[10px] font-bold font-mono tracking-[0.2em] mt-2">
                RISK SCORE
              </span>
            </div>
          </div>

          {/* ASSESSMENT DETAILS */}
          <div className="flex-grow text-center md:text-left">
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${theme.border} ${theme.bg} ${theme.color} text-xs font-semibold uppercase tracking-wider`}>
              <RiskIcon className="w-5 h-5" />
              <span className="font-bold">{theme.title}</span>
            </div>

            <div className="mt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-2">
                AI Threat Summary
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-7 max-w-2xl">
                {safeText(result?.summary, 'Analysis complete.')}
              </p>
            </div>

            {/* STATUS BADGES */}
            <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
              <div className="px-3 py-2 rounded-lg bg-slate-950/50 border border-cyber-border">
                <span className="text-[10px] font-mono text-slate-500">STATUS</span>
                <span className={`ml-2 text-[10px] font-mono font-bold ${theme.color}`}>
                  TC_RISK_{statusLevel}_{safeScore}
                </span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-950/50 border border-cyber-border">
                <span className="text-[10px] font-mono text-slate-500">WARNING SIGNALS</span>
                <span className="ml-2 text-[10px] font-mono font-bold text-slate-300">
                  {warningSigns.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WARNING SIGNS */}
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyber-secondary" />
              <h3 className="font-display font-bold text-lg text-white">Identified Warning Signs</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Indicators detected in the submitted content
            </p>
          </div>
          <div className="flex items-center justify-center min-w-9 h-9 px-2 rounded-xl bg-cyber-danger/10 border border-cyber-danger/20">
            <span className="text-sm font-bold text-cyber-danger">{warningSigns.length}</span>
          </div>
        </div>

        {warningSigns.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyber-success/10 border border-cyber-success/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-cyber-success" />
            </div>
            <p className="font-semibold text-slate-300">No major threat markers detected</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              The automated analysis did not flag critical scam patterns in the submitted text.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {warningSigns.map((sign, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-950/30 border border-cyber-border/80 hover:border-cyber-danger/30 hover:bg-slate-900/40 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cyber-danger/10 border border-cyber-danger/20 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono text-cyber-danger">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-semibold text-slate-100 text-sm">
                    {safeText(sign?.title, 'Suspicious Indicator')}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {safeText(sign?.description, 'A suspicious pattern was identified.')}
                  </p>
                </div>
                <AlertTriangle className="w-4 h-4 text-cyber-danger/60 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOMMENDED NEXT STEPS */}
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="border-b border-cyber-border pb-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyber-secondary" />
            <h3 className="font-display font-bold text-lg text-white">Recommended Safety Actions</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">Practical next steps after evaluating this content</p>
        </div>

        {nextSteps.length > 0 ? (
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/30 border border-cyber-border/80 hover:border-cyber-secondary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cyber-secondary/10 border border-cyber-secondary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-cyber-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono text-slate-500 mb-1">
                    ACTION {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {safeText(step)}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">No specific safety actions generated.</p>
          </div>
        )}
      </div>

      {/* DISCLAIMER */}
      <div className="p-5 bg-slate-950/45 border border-cyber-border rounded-2xl text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LockKeyhole className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-[0.16em]">
            Educational Assessment Disclaimer
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl mx-auto">
          This assessment is generated through automated pattern matching and AI threat evaluations. It does not constitute legal advice or guarantee absolute security. Always verify suspicious communications independently.
        </p>
      </div>

      {/* RESET BUTTON */}
      <div className="flex justify-center pt-1 pb-4">
        <button
          type="button"
          onClick={onReset}
          className="group flex items-center gap-2.5 bg-cyber-primary hover:bg-blue-500 text-white font-bold px-7 sm:px-9 py-4 rounded-xl shadow-[0_0_20px_-3px_rgba(37,99,235,0.45)] hover:shadow-[0_0_30px_0_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span>Analyze Another Item</span>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
}