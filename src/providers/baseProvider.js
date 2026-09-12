/**
 * BaseAIProvider
 * 
 * Abstract base class for all AI threat analysis providers in TrustCheck.
 * 
 * To add a new AI provider (e.g. OpenAI, Anthropic, Groq, Ollama):
 * 1. Create a new file in this directory (e.g., `openaiProvider.js`) extending `BaseAIProvider`.
 * 2. Implement `isConfigured()` to check if its API key/config exists in process.env.
 * 3. Implement `analyze(text)` to call the provider's API and return normalized results.
 * 4. Register the provider in `providerManager.js`.
 */

/**
 * Helper to normalize raw AI JSON output into TrustCheck's standard response schema.
 * 
 * @param {Object} rawJson 
 * @returns {Object} { riskScore, riskLevel, summary, warningSigns, recommendedActions }
 */
export function normalizeAIResponse(rawJson) {
  let riskScore = Number(rawJson?.riskScore);
  if (!Number.isFinite(riskScore)) {
    riskScore = 50;
  }
  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let rawLevel = typeof rawJson?.riskLevel === 'string' ? rawJson.riskLevel.trim() : '';
  const levelLower = rawLevel.toLowerCase();

  let riskLevel = 'Caution';
  if (levelLower.includes('high') || levelLower.includes('critical') || levelLower.includes('severe')) {
    riskLevel = 'High risk indicators';
  } else if (levelLower.includes('low')) {
    riskLevel = 'Low apparent risk';
  } else if (levelLower.includes('caution') || levelLower.includes('moderate') || levelLower.includes('medium')) {
    riskLevel = 'Caution';
  } else {
    if (riskScore >= 70) riskLevel = 'High risk indicators';
    else if (riskScore >= 35) riskLevel = 'Caution';
    else riskLevel = 'Low apparent risk';
  }

  let summary = typeof rawJson?.summary === 'string' ? rawJson.summary.trim() : '';
  if (!summary) {
    summary = riskScore >= 70
      ? 'Multiple suspicious patterns associated with scams were identified.'
      : riskScore >= 35
      ? 'Some suspicious patterns were identified. Proceed carefully.'
      : 'No major scam indicators were identified in the submitted content.';
  }

  let warningSigns = [];
  if (Array.isArray(rawJson?.warningSigns)) {
    warningSigns = rawJson.warningSigns.map((item) => {
      if (item && typeof item === 'object') {
        return {
          title: typeof item.title === 'string' ? item.title.trim() : 'Suspicious Indicator',
          description: typeof item.description === 'string' ? item.description.trim() : 'A suspicious pattern was identified.'
        };
      }
      if (typeof item === 'string') {
        return {
          title: 'Suspicious Indicator',
          description: item.trim()
        };
      }
      return null;
    }).filter(Boolean);
  }

  let recommendedActions = [];
  if (Array.isArray(rawJson?.recommendedActions)) {
    recommendedActions = rawJson.recommendedActions.map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        if (typeof item.action === 'string') return item.action.trim();
        if (typeof item.description === 'string') return item.description.trim();
        if (typeof item.text === 'string') return item.text.trim();
      }
      return '';
    }).filter(Boolean);
  }

  if (recommendedActions.length === 0) {
    recommendedActions = [
      'Do not share passwords, OTPs, PINs, or sensitive security credentials.',
      'Verify important claims independently using official contact information.',
      'Avoid clicking unexpected links or downloading unknown files.'
    ];
  }

  return {
    riskScore,
    riskLevel,
    summary,
    warningSigns,
    recommendedActions
  };
}

export class BaseAIProvider {
  /**
   * @param {string} name - Unique internal identifier for the provider (e.g., 'gemini')
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Checks whether this provider is properly configured (e.g. required API key exists).
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Executes AI threat analysis on the submitted message text.
   * Must return a normalized object or throw an Error on failure.
   * 
   * @param {string} _text 
   * @returns {Promise<Object>}
   */
  async analyze(_text) {
    throw new Error(`analyze() method not implemented in ${this.name}`);
  }
}
