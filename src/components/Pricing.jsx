import React, { useState } from 'react';
import { Check, Sparkles, Crown, Zap, Shield, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const { isPremium, openUpgradeModal, plans, monthlyScanCount, monthlyLimit } = useSubscription();
  const { user, openAuthModal } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const freePlan = plans.free;
  const premiumPlan = plans.premium;

  return (
    <section id="pricing" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-xs font-extrabold uppercase tracking-widest text-cyber-secondary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple & Transparent Plans</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            TrustCheck <span className="text-cyber-secondary">Plans & Pricing</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose the level of protection that fits your needs. Start free today or unlock 100 AI scans per month with Premium.
          </p>

          {/* Current User Plan & Usage Badge */}
          {user && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyber-border text-xs font-mono text-slate-300">
                <span>Account Status:</span>
                <span className={`font-bold uppercase ${isPremium ? 'text-cyber-secondary' : 'text-slate-200'}`}>
                  {isPremium ? 'PRO (PREMIUM)' : 'FREE PLAN'}
                </span>
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyber-border text-xs font-mono text-slate-300">
                <span>Monthly Usage:</span>
                <span className="font-bold text-cyber-secondary">
                  {monthlyScanCount} / {monthlyLimit} Scans
                </span>
              </span>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex justify-center">
            <div className="bg-slate-950/80 border border-cyber-border rounded-2xl p-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-cyber-primary text-white shadow-[0_0_15px_-3px_rgba(37,99,235,0.6)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing (₹29/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-cyber-primary text-white shadow-[0_0_15px_-3px_rgba(37,99,235,0.6)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing (₹299/yr)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-400 text-[9px] font-extrabold uppercase">Save ~14%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* FREE PLAN CARD */}
          <div className="glass-panel rounded-3xl p-8 border border-cyber-border flex flex-col justify-between relative hover:border-slate-700 transition-all duration-300 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyber-border flex items-center justify-center text-slate-400">
                  <Shield className="w-5 h-5" />
                </div>
                {user && !isPremium && (
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Your Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
                {freePlan.name}
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {freePlan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-cyber-border/70">
                <span className="text-4xl font-extrabold text-white font-mono">{freePlan.price}</span>
                <span className="text-xs text-slate-400 font-mono">/ {freePlan.period}</span>
              </div>

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                {freePlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {user && !isPremium ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-xl font-bold bg-slate-800/60 border border-slate-700 text-slate-400 cursor-default text-xs sm:text-sm"
                >
                  Active Plan (5 Scans/Mo)
                </button>
              ) : user && isPremium ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-xl font-bold bg-slate-800/60 border border-slate-700 text-slate-400 cursor-default text-xs sm:text-sm"
                >
                  Included in Membership
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="w-full py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 border border-cyber-border text-white transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* PREMIUM PLAN CARD */}
          <div className="glass-panel rounded-3xl p-8 border border-cyber-secondary/50 flex flex-col justify-between relative shadow-[0_0_35px_-8px_rgba(59,130,246,0.3)] hover:shadow-[0_0_45px_-5px_rgba(59,130,246,0.45)] transition-all duration-300 bg-slate-900/80">
            {/* Glowing Accent Badge */}
            <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Recommended</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyber-primary/20 border border-cyber-secondary/40 flex items-center justify-center text-cyber-secondary shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Crown className="w-5 h-5" />
                </div>
                {user && isPremium && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Your Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                <span>{premiumPlan.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-secondary/20 border border-cyber-secondary/40 text-cyber-secondary font-mono">PRO</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {premiumPlan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-cyber-border/70">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {billingCycle === 'annual' ? premiumPlan.annualPrice : premiumPlan.monthlyPrice}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {billingCycle === 'annual' ? ' / year' : ' / month'}
                </span>
              </div>

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                {premiumPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                    <div className="w-5 h-5 rounded-full bg-cyber-secondary/10 border border-cyber-secondary/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-cyber-secondary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={openUpgradeModal}
                className="w-full py-4 rounded-xl font-bold bg-cyber-primary hover:bg-blue-500 text-white shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)] hover:shadow-[0_0_35px_0_rgba(37,99,235,0.8)] transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isPremium ? 'Subscription Details' : 'Upgrade to Premium'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
