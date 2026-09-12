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
 * Implements TrustCheck AI analysis using Google's Gemini SDK (@google/genai).
 * Includes internal model cascade (gemini-3.6-flash -> gemini-3.5-flash-lite)
 * and retry logic for temporary transient API errors.
 */
export class GeminiAIProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
    this.models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
  }

  isConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && typeof key === 'string' && key.trim().length > 0 && !key.includes('your_gemini_api_key'));
  }

  async analyze(cleanMessage) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured in environment variables.');
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are the AI analysis engine for TrustCheck.

Analyze the submitted message for scam indicators, phishing, fraud, impersonation, social engineering, credential theft, suspicious links, or financial manipulation.

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
- riskScore: NUMBER 0-100 (0=very low risk, 100=extremely high risk).
- riskLevel: Exactly one of "Low apparent risk", "Caution", "High risk indicators".
- warningSigns: Array of objects with "title" and "description". Only include genuine indicators.
- recommendedActions: Array of practical safety action strings.
- Never claim content is 100% safe or 100% definitely a scam.
- Maintain an educational and probabilistic tone.

Submitted message:
${cleanMessage}
`;

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

          let responseText = '';
          if (typeof response?.text === 'string') {
            responseText = response.text;
          } else if (typeof response?.text === 'function') {
            responseText = response.text();
          }

          if (!responseText) {
            throw new Error(`Empty response received from Gemini model ${modelName}`);
          }

          const cleanedText = responseText
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

          const rawJson = JSON.parse(cleanedText);
          const normalized = normalizeAIResponse(rawJson);

          return {
            source: 'gemini',
            useDemo: false,
            modelUsed: modelName,
            ...normalized
          };
        } catch (err) {
          lastError = err;

          // If temporary/transient error, retry once
          if (attempt === 1 && isRetryableError(err)) {
            await sleep(1000);
          } else {
            // Stop retrying this model and advance to next model or fail
            break;
          }
        }
      }
    }

    throw lastError || new Error('All Gemini model cascade attempts failed.');
  }
}
