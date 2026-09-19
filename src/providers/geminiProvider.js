import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider, normalizeAIResponse } from './baseProvider.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = Number(error?.status) || Number(error?.code) || 0;
  const message = String(error?.message || '').toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes('high demand') ||
    message.includes('unavailable') ||
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted')
  );
}

/**
 * GeminiAIProvider
 *
 * Supports:
 * - Normal text analysis
 * - Screenshot/image analysis
 *
 * Uses the existing Gemini model cascade and retry logic.
 */
export class GeminiAIProvider extends BaseAIProvider {
  constructor() {
    super('gemini');

    this.models = [
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite'
    ];
  }

  isConfigured() {
    const key = process.env.GEMINI_API_KEY;

    return Boolean(
      key &&
      typeof key === 'string' &&
      key.trim().length > 0 &&
      !key.includes('your_gemini_api_key')
    );
  }

  /**
   * Shared TrustCheck analysis instructions.
   */
  buildAnalysisPrompt(contentDescription) {
    return `
You are the AI analysis engine for TrustCheck.

Analyze the submitted content for scam indicators, phishing, fraud, impersonation, social engineering, credential theft, suspicious links, fake login pages, financial manipulation, fake rewards, fake delivery notices, or other common scam patterns.

Return ONLY valid JSON.

Use this exact structure:
{
  "riskScore": 0,
  "riskLevel": "Caution",
  "summary": "Short explanation",
  "warningSigns": [
    {
      "title": "Short warning sign title",
      "description": "Explain why this is suspicious"
    }
  ],
  "recommendedActions": [
    "Practical safety action"
  ]
}

Rules:
- riskScore: NUMBER 0-100.
- 0 means very low apparent risk.
- 100 means extremely high risk.
- riskLevel must be exactly one of:
  "Low apparent risk"
  "Caution"
  "High risk indicators"
- warningSigns must contain only genuine indicators visible or present in the submitted content.
- recommendedActions must be practical safety actions.
- Never claim content is 100% safe.
- Never claim content is 100% definitely a scam.
- Maintain an educational and probabilistic tone.
- If analyzing an image, only describe information that is actually visible in the image.
- Do not invent text, URLs, logos, names, or details that cannot be reasonably observed.

Submitted content:
${contentDescription}
`;
  }

  /**
   * Analyze normal text content.
   */
  async analyze(cleanMessage) {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API key is not configured in environment variables.'
      );
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = this.buildAnalysisPrompt(cleanMessage);

    return this.runTextAnalysis(ai, prompt);
  }

  /**
   * Analyze an uploaded screenshot/image.
   *
   * imageData must contain:
   * {
   *   mimeType: 'image/png' | 'image/jpeg' | ...,
   *   data: base64 string
   * }
   */
  async analyzeImage(cleanMessage, imageData) {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API key is not configured in environment variables.'
      );
    }

    if (
      !imageData ||
      typeof imageData.data !== 'string' ||
      !imageData.data.trim()
    ) {
      throw new Error('Screenshot image data is missing.');
    }

    if (
      typeof imageData.mimeType !== 'string' ||
      !imageData.mimeType.startsWith('image/')
    ) {
      throw new Error('Unsupported screenshot image type.');
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = this.buildAnalysisPrompt(
      cleanMessage ||
        'Analyze this uploaded screenshot for scam and phishing indicators.'
    );

    let lastError = null;

    for (const modelName of this.models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: prompt
                  },
                  {
                    inlineData: {
                      mimeType: imageData.mimeType,
                      data: imageData.data
                    }
                  }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 800
            }
          });

          const responseText = this.extractResponseText(response);

          if (!responseText) {
            throw new Error(
              `Empty image response received from Gemini model ${modelName}`
            );
          }

          const rawJson = this.parseAIJson(responseText);
          const normalized = normalizeAIResponse(rawJson);

          return {
            source: 'gemini',
            provider: 'gemini',
            useDemo: false,
            modelUsed: modelName,
            ...normalized
          };
        } catch (err) {
          lastError = err;

          if (attempt === 1 && isRetryableError(err)) {
            await sleep(1000);
          } else {
            break;
          }
        }
      }
    }

    throw (
      lastError ||
      new Error('All Gemini screenshot analysis attempts failed.')
    );
  }

  /**
   * Execute normal text analysis against the Gemini model cascade.
   */
  async runTextAnalysis(ai, prompt) {
    let lastError = null;

    for (const modelName of this.models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 800
            }
          });

          const responseText = this.extractResponseText(response);

          if (!responseText) {
            throw new Error(
              `Empty response received from Gemini model ${modelName}`
            );
          }

          const rawJson = this.parseAIJson(responseText);
          const normalized = normalizeAIResponse(rawJson);

          return {
            source: 'gemini',
            provider: 'gemini',
            useDemo: false,
            modelUsed: modelName,
            ...normalized
          };
        } catch (err) {
          lastError = err;

          if (attempt === 1 && isRetryableError(err)) {
            await sleep(1000);
          } else {
            break;
          }
        }
      }
    }

    throw (
      lastError ||
      new Error('All Gemini model cascade attempts failed.')
    );
  }

  /**
   * Safely extract generated text from the Gemini response.
   */
  extractResponseText(response) {
    if (typeof response?.text === 'string') {
      return response.text.trim();
    }

    if (typeof response?.text === 'function') {
      const text = response.text();
      return typeof text === 'string' ? text.trim() : '';
    }

    return '';
  }

  /**
   * Parse JSON while handling accidental markdown code fences.
   */
  parseAIJson(responseText) {
    const cleanedText = responseText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleanedText);
  }
}