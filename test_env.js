import dotenv from 'dotenv';
const result = dotenv.config();
console.log('Dotenv configuration result:', result);
console.log('Keys in process.env containing GEMINI:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
console.log('Value of GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'undefined');
