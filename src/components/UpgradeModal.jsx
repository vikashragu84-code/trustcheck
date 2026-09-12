import React from 'react';
import { Sparkles, Crown, CheckCircle2, X, ShieldCheck, Zap } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function UpgradeModal() {
  const { isUpgradeModalOpen, closeUpgradeModal, plans, hasReachedLimit } = useSubscription();

  if (!isUpgradeModalOpen) return null;

  const premiumPlan = plans.premium;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-cyber-secondary/40 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] overflow-hidden relative my-auto">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyber-primary via-cyber-secondary to-purple-500" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 text-center relative border-b border-cyber-border/60">
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-900 border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-primary/20 via-cyber-secondary/20 to-purple-500/20 border border-cyber-secondary/40 flex items-center justify-center mx-auto mb-4 text-cyber-secondary shadow-[0_0_25px_-5px_rgba(59,130,246,0.6)]">
            <Crown className="w-7 h-7 text-cyber-secondary" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-secondary/10 border border-cyber-secondary/30 text-[10px] font-bold uppercase tracking-widest text-cyber-secondary mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Premium Preview • Coming Soon</span>
          </div>

          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            TrustCheck <span className="bg-gradient-to-r from-cyber-secondary via-blue-400 to-purple-400 bg-clip-text text-transparent">Premium</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
            {hasReachedLimit
              ? "You have used your 5 free AI scans for this month. Upgrade to Premium for 100 AI scans per month!"
              : "We are preparing our automated payment gateway. Premium accounts will be available soon!"}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-950/60 border border-cyber-border rounded-2xl p-5 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border/60">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">TIER</span>
                <div className="font-bold text-white text-base">Premium Plan</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white font-mono">{premiumPlan.monthlyPrice}</span>
                <span className="text-[10px] text-slate-400 font-mono block">or {premiumPlan.annualPrice}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {premiumPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-cyber-primary/10 border border-cyber-primary/20 rounded-xl p-3.5 text-xs text-slate-300">
            <Zap className="w-4 h-4 text-cyber-secondary flex-shrink-0" />
            <span>No payment or credit card is required today. You will be notified when online payments launch!</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                console.log('[TrustCheck Subscription] User expressed interest in Premium upgrade.');
                closeUpgradeModal();
              }}
              className="w-full py-3.5 rounded-xl font-bold bg-cyber-primary hover:bg-blue-500 text-white shadow-[0_0_20px_-3px_rgba(37,99,235,0.55)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Got It • Join Early Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
