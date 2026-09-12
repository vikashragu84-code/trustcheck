import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signIn,
    signUp
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setEmail('');
      setPassword('');
      setFullName('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (authModalMode === 'signup') {
        const { needsEmailVerification } = await signUp({ email, password, fullName });
        if (needsEmailVerification) {
          setSuccessMsg('Account created! Please check your email to verify your account.');
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            closeAuthModal();
          }, 1500);
        }
      } else {
        await signIn({ email, password });
        closeAuthModal();
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={closeAuthModal}
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md bg-cyber-bg/95 border border-cyber-border rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_-10px_rgba(37,99,235,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-cyber-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-cyber-secondary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyber-primary/20 border border-cyber-secondary/40 text-cyber-secondary mb-3 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            {authModalMode === 'signup' ? 'Create TrustCheck Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'signup' 
              ? 'Sign up to access security risk assessment features' 
              : 'Sign in to manage your TrustCheck profile'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900/80 border border-cyber-border/80 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setAuthModalMode('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              authModalMode === 'signin'
                ? 'bg-cyber-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-cyber-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950/80 border border-cyber-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950/80 border border-cyber-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950/80 border border-cyber-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-lg font-semibold text-xs text-white bg-cyber-primary hover:bg-blue-500 transition-all duration-200 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{authModalMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
