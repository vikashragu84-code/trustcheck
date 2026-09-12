import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

console.time('Gemini');

try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `
Analyze this message for scam warning signs:

URGENT! Your bank account will be blocked. Send your OTP immediately.

Return ONLY JSON.
`
  });

  console.timeEnd('Gemini');

  console.log(response.text);

} catch (error) {

  console.timeEnd('Gemini');

  console.error('ERROR:');
  console.error(error.message);
}