import Groq from 'groq-sdk';
import { BaseAIProvider, normalizeAIResponse } from './baseProvider.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = Number(error?.status) || Number(error?.code) || Number(error?.response?.status) || 0;
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
    message.includes('rate limit')
  );
}

/**
 * GroqAIProvider
 * 
 * Implements TrustCheck AI analysis using Groq's official Node SDK (groq-sdk).
 * Model: openai/gpt-oss-20b
 */
export class GroqAIProvider extends BaseAIProvider {
  constructor() {
    super('groq');
    this.model = 'openai/gpt-oss-20b';
  }

  isConfigured() {
    const key = process.env.GROQ_API_KEY;
    return Boolean(key && typeof key === 'string' && key.trim().length > 0 && !key.includes('your_groq_api_key'));
  }

  async analyze(cleanMessage) {
    if (!this.isConfigured()) {
      throw new Error('Groq API key is not configured in environment variables.');
    }

    const apiKey = process.env.GROQ_API_KEY.trim();
    const groq = new Groq({ apiKey });

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

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: this.model,
          temperature: 0.1,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '';

        if (!responseText) {
          throw new Error(`Empty response received from Groq model ${this.model}`);
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
          source: 'groq',
          provider: 'groq',
          useDemo: false,
          modelUsed: this.model,
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

    throw lastError || new Error('Groq AI provider analysis failed.');
  }
}
