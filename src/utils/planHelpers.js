/**
 * Plan definitions and helper utilities for TrustCheck FREE vs PREMIUM subscription system.
 */

export const PLAN_LIMITS = {
  free: 5,
  premium: 100
};

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    badge: 'Free Plan',
    price: '₹0',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    period: 'forever',
    monthlyLimit: PLAN_LIMITS.free,
    description: 'Essential scam risk assessment and scan history for everyday safety.',
    features: [
      '5 AI scans per month',
      'Basic scam analysis',
      'Scan history',
      'Standard risk report'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    badge: 'PRO',
    price: '₹29',
    monthlyPrice: '₹29/month',
    annualPrice: '₹299/year',
    period: 'per month',
    monthlyLimit: PLAN_LIMITS.premium,
    description: 'Complete threat detection suite with priority AI multi-model evaluations.',
    features: [
      '100 AI scans per month',
      'Full scan history',
      'Advanced AI analysis',
      'Detailed reports',
      'Screenshot/image analysis',
      'Priority processing'
    ]
  }
};

/**
 * Normalizes any plan string value to 'free' or 'premium'.
 * Default fallback is 'free'.
 * 
 * @param {string} plan 
 * @returns {'free' | 'premium'}
 */
export function normalizePlan(plan) {
  if (!plan || typeof plan !== 'string') return 'free';
  const clean = plan.trim().toLowerCase();
  return clean === 'premium' ? 'premium' : 'free';
}

/**
 * Helper to check if a profile/user is on Premium plan.
 * 
 * @param {Object} profile - User profile object from public.profiles
 * @returns {boolean}
 */
export function isPremiumPlan(profile) {
  return normalizePlan(profile?.plan) === 'premium';
}

/**
 * Gets the guest scan count for the current calendar month from localStorage.
 * 
 * @returns {number}
 */
export function getGuestScanCount() {
  try {
    const now = new Date();
    const monthKey = `trustcheck_guest_scans_${now.getFullYear()}_${now.getMonth() + 1}`;
    const stored = localStorage.getItem(monthKey);
    return stored ? Number(stored) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Increments the guest scan count for the current calendar month in localStorage.
 * 
 * @returns {number}
 */
export function incrementGuestScanCount() {
  try {
    const now = new Date();
    const monthKey = `trustcheck_guest_scans_${now.getFullYear()}_${now.getMonth() + 1}`;
    const current = getGuestScanCount();
    const updated = current + 1;
    localStorage.setItem(monthKey, String(updated));
    return updated;
  } catch {
    return 1;
  }
}
