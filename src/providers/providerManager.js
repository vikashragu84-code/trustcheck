import { GeminiAIProvider } from './geminiProvider.js';
import { GroqAIProvider } from './groqProvider.js';
import { analyzeMessage } from '../utils/scannerLogic.js';

/**
 * ProviderManager
 * 
 * Central multi-provider orchestrator for TrustCheck backend AI analysis.
 * 
 * How it works:
 * 1. Reads `AI_PROVIDER_ORDER` from process.env (defaults to 'gemini,groq').
 * 2. Checks which providers are configured (i.e. required API keys exist).
 * 3. Tries providers sequentially in the configured order.
 * 4. If a provider fails (e.g. 403 PERMISSION_DENIED, rate limit, or network error),
 *    it automatically logs the server failure and fails over to the next provider.
 * 5. If all configured providers fail (or no provider API keys are set),
 *    it seamlessly uses TrustCheck's local heuristic safety engine (source: 'local').
 */
export class ProviderManager {
  constructor() {
    // Registry of supported AI providers
    this.knownProviders = {
      gemini: new GeminiAIProvider(),
      groq: new GroqAIProvider()
    };
  }

  /**
   * Resolves the list of active, configured providers in order of preference.
   * @returns {Array<BaseAIProvider>}
   */
  getEnabledProviders() {
    const rawOrder = process.env.AI_PROVIDER_ORDER || 'gemini,groq';
    const providerKeys = rawOrder
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const enabled = [];

    for (const key of providerKeys) {
      const provider = this.knownProviders[key];
      if (provider && provider.isConfigured()) {
        enabled.push(provider);
      }
    }

    return enabled;
  }

  /**
   * Executes AI threat analysis with automatic failover to fallback providers or local engine.
   * 
   * @param {string} cleanMessage - Sanitized text content to evaluate
   * @returns {Promise<Object>} Normalized TrustCheck evaluation response
   */
  async analyze(cleanMessage) {
    const providers = this.getEnabledProviders();

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`[AI] Trying provider: ${provider.name}`);

      try {
        const result = await provider.analyze(cleanMessage);
        if (provider.name === 'groq') {
          console.log('[AI] Groq analysis successful');
        } else {
          console.log(`[AI] Provider succeeded: ${provider.name}`);
        }
        return {
          source: result.source || provider.name,
          provider: result.provider || provider.name,
          useDemo: false,
          ...result
        };
      } catch (err) {
        console.log(`[AI] Provider unavailable: ${provider.name}`);
      }
    }

    // ALL PROVIDERS FAILED OR NONE CONFIGURED -> USE LOCAL SAFETY ENGINE
    console.log('[AI] All AI providers unavailable. Using local safety engine.');
    const localResult = analyzeMessage(cleanMessage);

    return {
      source: 'local',
      provider: 'local',
      useDemo: true,
      ...localResult
    };
  }
}

export const providerManager = new ProviderManager();

