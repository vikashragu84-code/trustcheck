import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { PLANS, PLAN_LIMITS, normalizePlan, isPremiumPlan, getGuestScanCount } from '../utils/planHelpers';
import { getMonthlyScanCountFromDB } from '../lib/scanHistory';

const SubscriptionContext = createContext({});

export function SubscriptionProvider({ children }) {
  const { user, profile } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [monthlyScanCount, setMonthlyScanCount] = useState(0);

  // Derived plan state from authenticated user's public.profiles record
  const currentPlan = user ? normalizePlan(profile?.plan) : 'free';
  const isPremium = user ? isPremiumPlan(profile) : false;
  const planDetails = PLANS[currentPlan] || PLANS.free;
  const monthlyLimit = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  // Fetch monthly scan usage count
  const refreshScanCount = useCallback(async () => {
    if (user?.id) {
      const count = await getMonthlyScanCountFromDB(user.id);
      setMonthlyScanCount(count);
    } else {
      const count = getGuestScanCount();
      setMonthlyScanCount(count);
    }
  }, [user]);

  useEffect(() => {
    refreshScanCount();
  }, [refreshScanCount]);

  const hasReachedLimit = monthlyScanCount >= monthlyLimit;
  const scansRemaining = Math.max(0, monthlyLimit - monthlyScanCount);

  const openUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const openLimitModal = () => {
    setIsLimitModalOpen(true);
  };

  const closeLimitModal = () => {
    setIsLimitModalOpen(false);
  };

  /**
   * Helper to check if another scan is allowed for the user.
   * If not allowed, opens appropriate modal (UpgradeModal for Free/Guest, LimitModal for Premium).
   * 
   * @returns {boolean} true if scan is permitted
   */
  const checkAndEnforceScanLimit = () => {
    if (hasReachedLimit) {
      if (isPremium) {
        openLimitModal();
      } else {
        openUpgradeModal();
      }
      return false;
    }
    return true;
  };

  const value = {
    currentPlan,
    isPremium,
    planDetails,
    plans: PLANS,
    monthlyLimit,
    monthlyScanCount,
    scansRemaining,
    hasReachedLimit,
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    isLimitModalOpen,
    openLimitModal,
    closeLimitModal,
    refreshScanCount,
    checkAndEnforceScanLimit
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
