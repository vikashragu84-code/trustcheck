import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Sanitizes sensitive content (passwords, tokens, API keys) from text before saving to database.
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeMessage(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/Bearer\s+[A-Za-z0-9\-_~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(password|passwd|pwd)\s*[:=]\s*\S+/gi, '$1: [REDACTED_PASSWORD]')
    .replace(/(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*\S+/gi, '$1: [REDACTED_KEY]')
    .replace(/\b(sk-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36})\b/g, '[REDACTED_KEY]');
}

/**
 * Saves a completed scan record to the public.scans table in Supabase.
 * Only saves when a valid logged-in user ID is provided.
 * Fails gracefully without throwing errors to ensure UI scan results are never blocked.
 * 
 * @param {Object} params
 * @param {string} params.userId - Authenticated user's ID
 * @param {string} params.messageText - Submitted scan message or text
 * @param {number} params.riskScore - Calculated risk score (0-100)
 * @param {string} params.riskLevel - Risk level label
 * @param {string} params.summary - Summary text of evaluation
 * @param {Array} params.warningSigns - Array of warning sign objects
 * @param {Array} params.recommendedActions - Array of recommended action strings
 * @param {string} params.source - Source of analysis ('gemini' | 'local')
 * @returns {Promise<{saved: boolean, data?: any, error?: any, reason?: string}>}
 */
export async function saveScanRecord({
  userId,
  messageText,
  riskScore,
  riskLevel,
  summary,
  warningSigns,
  recommendedActions,
  source
}) {
  if (!userId) {
    console.log('[TrustCheck Scan History] Guest scan detected. Skipping scan record save.');
    return { saved: false, reason: 'guest' };
  }

  if (!isSupabaseConfigured()) {
    console.warn('[TrustCheck Scan History] Supabase is not configured. Cannot save scan record.');
    return { saved: false, reason: 'unconfigured' };
  }

  try {
    console.log('[TrustCheck Scan History] Saving scan record...');

    const record = {
      user_id: userId,
      message_text: sanitizeMessage(messageText),
      risk_score: Math.max(0, Math.min(100, Math.round(Number(riskScore) || 0))),
      risk_level: String(riskLevel || 'Caution'),
      summary: String(summary || ''),
      warning_signs: Array.isArray(warningSigns) ? warningSigns : [],
      recommended_actions: Array.isArray(recommendedActions) ? recommendedActions : [],
      source: String(source || 'gemini'),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('scans')
      .insert([record])
      .select();

    if (error) {
      console.warn('[TrustCheck Scan History] Unable to save scan record.');
      return { saved: false, error };
    }

    console.log('[TrustCheck Scan History] Scan record saved successfully.');
    return { saved: true, data };
  } catch (err) {
    console.warn('[TrustCheck Scan History] Unable to save scan record.');
    return { saved: false, error: err };
  }
}

/**
 * Fetches all saved scan records for the specified authenticated user from public.scans.
 * Ordered newest first.
 * 
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function getUserScans(userId) {
  if (!userId || !isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  try {
    console.log('[TrustCheck Scan History] Loading scan history...');
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[TrustCheck Scan History] Unable to load scan history.');
      return { data: null, error };
    }

    console.log('[TrustCheck Scan History] Scan history loaded successfully.');
    return { data, error: null };
  } catch (err) {
    console.warn('[TrustCheck Scan History] Unable to load scan history.');
    return { data: null, error: err };
  }
}

/**
 * Counts the number of scans executed by the user in the current calendar month from public.scans.
 * 
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<number>}
 */
export async function getMonthlyScanCountFromDB(userId) {
  if (!userId || !isSupabaseConfigured()) {
    return 0;
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count, error } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);

    if (error) {
      console.warn('[TrustCheck Entitlement] Unable to fetch monthly scan count.');
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.warn('[TrustCheck Entitlement] Unable to fetch monthly scan count.');
    return 0;
  }
}



