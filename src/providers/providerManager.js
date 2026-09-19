import { GeminiAIProvider } from './geminiProvider.js';
import { GroqAIProvider } from './groqProvider.js';
import { analyzeMessage } from '../utils/scannerLogic.js';

/**
 * ProviderManager
 *
 * Central multi-provider orchestrator for TrustCheck backend AI analysis.
 *
 * Supports:
 * - Normal text analysis
 * - Optional screenshot/image analysis
 *
 * Provider order:
 * Gemini -> Groq -> Local Safety Engine
 */
export class ProviderManager {
  constructor() {
    this.knownProviders = {
      gemini: new GeminiAIProvider(),
      groq: new GroqAIProvider()
    };
  }

  /**
   * Returns configured providers in the order defined by AI_PROVIDER_ORDER.
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
   * Executes TrustCheck analysis with automatic provider failover.
   *
   * @param {string} cleanMessage
   * @param {Object|null} imageData
   * @returns {Promise<Object>}
   */
  async analyze(cleanMessage, imageData = null) {
    const providers = this.getEnabledProviders();

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];

      console.log(`[AI] Trying provider: ${provider.name}`);

      try {
        let result;

        // If an image was supplied, use the provider's image-analysis
        // capability when available.
        if (imageData && typeof provider.analyzeImage === 'function') {
          result = await provider.analyzeImage(cleanMessage, imageData);
        } else {
          // Existing text-analysis path remains unchanged.
          result = await provider.analyze(cleanMessage);
        }

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
        // Safe diagnostic logging for debugging provider failures
        console.error(`[AI DIAGNOSTIC ERROR] Provider: ${provider.name}`);
        console.error(`  - Error Name: ${err?.name}`);
        console.error(`  - Error Message: ${err?.message}`);
        console.error(`  - Status/Code: ${err?.status || err?.statusCode || err?.code || err?.response?.status || 'N/A'}`);
        if (err?.stack) {
          console.error(`  - Stack: ${err.stack}`);
        }
        console.log(`[AI] Provider unavailable: ${provider.name}`);
      }
    }

    // ALL PROVIDERS FAILED OR NONE CONFIGURED
    // Fall back to the existing local safety engine.
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