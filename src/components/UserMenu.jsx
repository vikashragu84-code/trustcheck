import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldCheck, ChevronDown, History, Crown, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function UserMenu({ onNavigate }) {
  const { user, profile, signOut } = useAuth();
  const { isPremium, openUpgradeModal } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleHistoryClick = () => {
    setIsOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate('history');
    }
  };

  const handleUpgradeClick = () => {
    setIsOpen(false);
    openUpgradeModal();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyber-border hover:border-cyber-secondary/50 text-slate-200 hover:text-white transition-all cursor-pointer group"
      >
        <div className="w-7 h-7 rounded-full bg-cyber-primary/20 border border-cyber-secondary/40 flex items-center justify-center text-cyber-secondary group-hover:scale-105 transition-transform">
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium max-w-[130px] truncate">{displayName}</span>
        {isPremium && (
          <span className="px-1.5 py-0.5 rounded bg-cyber-secondary/20 border border-cyber-secondary/40 text-[9px] font-mono font-bold text-cyber-secondary">
            PRO
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-cyber-border rounded-xl shadow-2xl backdrop-blur-xl z-50 py-2">
          <div className="px-4 py-3 border-b border-cyber-border/60">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyber-secondary" />
                <p className="text-xs font-semibold uppercase text-cyber-secondary tracking-wider">Account Verified</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${
                isPremium ? 'bg-cyber-secondary/20 border border-cyber-secondary/40 text-cyber-secondary' : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {isPremium ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 truncate">{user.email}</p>
            {profile?.full_name && (
              <p className="text-xs text-slate-400 truncate mt-0.5">{profile.full_name}</p>
            )}
          </div>

          <div className="px-2 pt-2 space-y-1">
            <button
              onClick={handleHistoryClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-cyber-secondary" />
              <span>Scan History</span>
            </button>

            <button
              onClick={handleUpgradeClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-cyber-secondary hover:text-white hover:bg-cyber-primary/20 transition-colors cursor-pointer font-semibold"
            >
              {isPremium ? <Crown className="w-4 h-4 text-cyber-secondary" /> : <Zap className="w-4 h-4 text-cyber-secondary" />}
              <span>{isPremium ? 'Subscription Details' : 'Upgrade to Premium'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
