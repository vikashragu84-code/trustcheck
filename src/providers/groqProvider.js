import Groq from 'groq-sdk';
import { BaseAIProvider, normalizeAIResponse } from './baseProvider.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status =
    Number(error?.status) ||
    Number(error?.code) ||
    Number(error?.response?.status) ||
    0;

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
 * Supports:
 * - Normal text analysis using GPT-OSS 20B
 * - Screenshot analysis using a vision-capable Qwen model
 */
export class GroqAIProvider extends BaseAIProvider {
  constructor() {
    super('groq');

    // Existing text model — DO NOT CHANGE
    this.model = 'openai/gpt-oss-20b';

    // Vision model used only for screenshots
    this.visionModel = 'qwen/qwen3.8-27b';
  }

  isConfigured() {
    const key = process.env.GROQ_API_KEY;

    return Boolean(
      key &&
      typeof key === 'string' &&
      key.trim().length > 0 &&
      !key.includes('your_groq_api_key')
    );
  }

  /**
   * Shared TrustCheck instructions.
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
- warningSigns must contain only genuine indicators.
- recommendedActions must be practical safety actions.
- Never claim content is 100% safe.
- Never claim content is 100% definitely a scam.
- Maintain an educational and probabilistic tone.
- If analyzing an image, only describe information actually visible in the image.
- Do not invent text, URLs, logos, names, or other details that cannot reasonably be observed.

Submitted content:
${contentDescription}
`;
  }

  /**
   * Existing normal text analysis.
   * This remains compatible with your current Message and Link scanner.
   */
  async analyze(cleanMessage) {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq API key is not configured in environment variables.'
      );
    }

    const apiKey = process.env.GROQ_API_KEY.trim();
    const groq = new Groq({ apiKey });

    const prompt = this.buildAnalysisPrompt(cleanMessage);

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

        const responseText =
          chatCompletion.choices[0]?.message?.content || '';

        if (!responseText) {
          throw new Error(
            `Empty response received from Groq model ${this.model}`
          );
        }

        const rawJson = this.parseAIJson(responseText);
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

  /**
   * Screenshot/image analysis.
   *
   * imageData:
   * {
   *   mimeType: 'image/png' | 'image/jpeg' | ...,
   *   data: 'base64 string'
   * }
   */
  async analyzeImage(cleanMessage, imageData) {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq API key is not configured in environment variables.'
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

    const apiKey = process.env.GROQ_API_KEY.trim();
    const groq = new Groq({ apiKey });

    const prompt = this.buildAnalysisPrompt(
      cleanMessage ||
        'Analyze this uploaded screenshot for scam and phishing indicators.'
    );

    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          model: this.visionModel,
          temperature: 0.1,
          max_tokens: 800,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageData.mimeType};base64,${imageData.data}`
                  }
                }
              ]
            }
          ]
        });

        const responseText =
          chatCompletion.choices[0]?.message?.content || '';

        if (!responseText) {
          throw new Error(
            `Empty screenshot response received from Groq model ${this.visionModel}`
          );
        }

        const rawJson = this.parseAIJson(responseText);
        const normalized = normalizeAIResponse(rawJson);

        return {
          source: 'groq',
          provider: 'groq',
          useDemo: false,
          modelUsed: this.visionModel,
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

    throw (
      lastError ||
      new Error('Groq screenshot analysis failed.')
    );
  }

  /**
   * Safely parse provider JSON.
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