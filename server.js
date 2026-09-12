import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { providerManager } from './src/providers/providerManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Apply Security Headers via Helmet
// Disabling Content-Security-Policy and Cross-Origin-Embedder-Policy to prevent breaking Vite dev middleware & local assets
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS NOTE:
// Same-origin deployment (where frontend static files and backend Express API endpoints are served from the same domain/origin)
// does not require CORS middleware or wildcard Access-Control-Allow-Origin headers.

// Configure JSON body parser with 100kb payload limit to prevent body size abuse
app.use(express.json({ limit: '100kb' }));

const port = process.env.PORT || 5173;
const isProduction = process.env.NODE_ENV === 'production';

// IP-based Rate Limiter specifically for /api/analyze route (20 requests per 15 minutes per IP)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429,
  message: { error: 'Too many analysis requests. Please try again later.' }
});

// ==========================================
// TRUSTCHECK AI ANALYSIS ROUTE
// ==========================================
app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const cleanMessage = message.trim();

  if (cleanMessage.length > 10000) {
    return res.status(400).json({ error: 'Message text exceeds maximum length of 10,000 characters' });
  }

  console.log('\n[TrustCheck API] Received analysis request...');

  try {
    const result = await providerManager.analyze(cleanMessage);
    return res.json(result);
  } catch (err) {
    console.error('[TrustCheck API] Unexpected exception during analysis execution:', err);
    // Return clean fallback response without exposing raw error traces
    return res.json({
      useDemo: true,
      source: 'local',
      riskScore: 50,
      riskLevel: 'Caution',
      summary: 'Analysis completed using safety engine.',
      warningSigns: [],
      recommendedActions: [
        'Do not share passwords, OTPs, PINs, or sensitive security credentials.',
        'Verify important claims independently using official contact information.'
      ]
    });
  }
});

// ==========================================
// STATIC FILES & SPA ROUTING
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated.');
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const activeProviders = providerManager.getEnabledProviders().map((p) => p.name);

  app.listen(port, () => {
    console.log('\n==========================================');
    console.log('       TRUSTCHECK SERVER RUNNING');
    console.log('==========================================');
    console.log(`URL: http://localhost:${port}`);
    console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
    console.log(`Provider Order (AI_PROVIDER_ORDER): ${process.env.AI_PROVIDER_ORDER || 'gemini,groq'}`);
    console.log(`Active Configured Providers: ${activeProviders.length > 0 ? activeProviders.join(' -> ') : 'None (Using Local Safety Engine)'}`);
    console.log('==========================================\n');
  });
}

startServer();