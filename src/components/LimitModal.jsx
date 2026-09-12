import React from 'react';
import { ShieldAlert, Calendar, X } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function LimitModal() {
  const { isLimitModalOpen, closeLimitModal, monthlyScanCount, monthlyLimit } = useSubscription();

  if (!isLimitModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-cyber-warning/40 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] overflow-hidden relative my-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-cyber-warning to-orange-500" />

        <div className="p-6 sm:p-8 text-center relative">
          <button
            type="button"
            onClick={closeLimitModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-900 border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-cyber-warning shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <ShieldAlert className="w-7 h-7 text-cyber-warning" />
          </div>

          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Monthly Scan Limit Reached
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            You have used all <span className="font-bold text-white">{monthlyLimit} AI scans</span> included in your Premium plan for this calendar month.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-cyber-border space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Monthly Usage</span>
              <span className="font-mono font-bold text-cyber-warning">{monthlyScanCount} / {monthlyLimit} scans</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyber-warning rounded-full w-full" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5 text-cyber-secondary flex-shrink-0" />
              <span>Your limit will automatically reset on the 1st of next month.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLimitModal}
            className="w-full py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer text-xs sm:text-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
