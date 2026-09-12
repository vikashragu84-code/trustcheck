import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

console.time('Test gemini-2.5-flash');
try {
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say Hello in JSON: {"message": "hello"}'
  });
  console.timeEnd('Test gemini-2.5-flash');
  console.log('gemini-2.5-flash response:', res.text);
} catch (e) {
  console.timeEnd('Test gemini-2.5-flash');
  console.error('gemini-2.5-flash error:', e.message);
}

console.time('Test gemini-3.5-flash-lite');
try {
  const res = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: 'Say Hello in JSON: {"message": "hello"}'
  });
  console.timeEnd('Test gemini-3.5-flash-lite');
  console.log('gemini-3.5-flash-lite response:', res.text);
} catch (e) {
  console.timeEnd('Test gemini-3.5-flash-lite');
  console.error('gemini-3.5-flash-lite error:', e.message);
}

console.time('Test gemini-3.6-flash');
try {
  const res = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Say Hello in JSON: {"message": "hello"}'
  });
  console.timeEnd('Test gemini-3.6-flash');
  console.log('gemini-3.6-flash response:', res.text);
} catch (e) {
  console.timeEnd('Test gemini-3.6-flash');
  console.error('gemini-3.6-flash error:', e.message);
}
