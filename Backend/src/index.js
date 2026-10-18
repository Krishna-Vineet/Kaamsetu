import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { uploadsDir } from './utils/uploadStaging.js';
import { emailFallbackActive, smsFallbackActive } from './utils/otpDelivery.js';

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import workerRoutes from './routes/workers.js';
import clientRoutes from './routes/client.js';
import adminRoutes from './routes/admin.js';


const isProduction = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Fail fast on missing critical configuration
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('   Run  npm run env:check  — it audits your Backend/.env and shows exactly what is wrong.');
  console.error('   (The .env file must live in this Backend/ folder, next to package.json.');
  console.error('    On Windows, watch out for smart quotes (“ ”) pasted from editors.)');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET is shorter than 32 characters. Generate a stronger one:');
  console.warn("   node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"");
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️  JWT_REFRESH_SECRET is not set — falling back to JWT_SECRET. Set a separate secret in production.');
}

// Warn loudly when OTP delivery runs in fallback (demo) mode.
if (emailFallbackActive()) {
  console.warn('⚠️  EMAIL OTP DELIVERY IS IN FALLBACK MODE — codes are returned in API responses (devOtp) instead of being emailed.');
  console.warn('    Configure RESEND_API_KEY + EMAIL_FROM for real delivery. Do not rely on fallback mode in production.');
}
if (smsFallbackActive()) {
  console.warn('⚠️  SMS OTP DELIVERY IS IN FALLBACK MODE — codes are returned in API responses (devOtp) instead of being sent via Twilio.');
}

const app = express();

// Trust the first reverse proxy hop (Render/Vercel/NGINX) so secure cookies
// and rate-limit client IPs work correctly.
app.set('trust proxy', 1);

// Disable the X-Powered-By fingerprint.
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// Security middleware (installed in package.json since day one — now actually used)
// ---------------------------------------------------------------------------
app.use(helmet({
  // /uploads images are consumed by front-ends on other subdomains.
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(mongoSanitize()); // strips $ / . operators from req payloads (NoSQL injection)
app.use(hpp());           // HTTP parameter pollution

// ---------------------------------------------------------------------------
// CORS — env-driven allowlist, localhost only outside production
// ---------------------------------------------------------------------------
const defaultOrigins = [
  'https://kaamsetu.co.in',
  'https://www.kaamsetu.co.in',
  'https://app.kaamsetu.co.in',
  'https://admin.kaamsetu.co.in'
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins
);

if (!isProduction) {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174');
}

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin header (curl, Postman, same-origin, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ---------------------------------------------------------------------------
// Rate limiting (in-memory — swap for a Redis store when running many instances)
// ---------------------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Stricter bucket for credential + OTP endpoints (brute-force / spam shield)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' }
});

app.use(apiLimiter);
app.use('/auth', authLimiter);
app.use('/admin/verify', authLimiter);

// ---------------------------------------------------------------------------
// Parsers, logging, static files
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// ---------------------------------------------------------------------------
// MongoDB — cached connection so serverless cold starts reuse warm connections
//
// Serverless gotcha this design handles: a frozen/thawed function can hold a
// DEAD cached connection object (idle sockets severed while suspended). Reusing
// it means "connected" is never re-attempted and every request 503s forever on
// that instance. So we only reuse a cached connection when the driver still
// reports readyState 1, and the request gate below (not just module load) is
// what actually drives connectDB — self-healing warm instances.
// ---------------------------------------------------------------------------
let cached = globalThis._kaamsetuMongoose;
if (!cached) {
  cached = globalThis._kaamsetuMongoose = { conn: null, promise: null };
}

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set — every DB request will 503. \
Set it in your host\'s env (Vercel → Settings → Environment Variables, \
Production scope) and REDEPLOY. Note: it is MONGODB_URI here, not MONGO_URI.');
}

async function connectDB() {
  // Reuse only a LIVE connection; a severed one must be re-established.
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  cached.conn = null;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        // Serverless-friendly pool: default 100 connections per function
        // instance can exhaust small Atlas tiers from a handful of cold starts.
        maxPoolSize: 10,
      })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
  return cached.conn;
}

// Kick off the first connection attempt at module load — a fire-and-forget
// retry loop. The request gate below performs the authoritative reconnect.
const connectWithRetry = (attempt = 1) => {
  connectDB().catch(() => {
    const delayMs = Math.min(2000 * attempt, 15000);
    console.error(`   ⏳ Retrying MongoDB connection in ${delayMs / 1000}s (attempt ${attempt})…`);
    setTimeout(() => connectWithRetry(attempt + 1), delayMs);
  });
};
connectWithRetry();

// Gate DB-bound routes while the database is unreachable. When no connection
// attempt is in flight, run one on-demand — this is what heals dropped
// serverless connections — so the first request reconnects instead of 503ing.
// If an attempt IS in flight (cold-start retry loop), fail fast with 503
// rather than double-parking the request behind it.
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !cached.promise) {
    try {
      await connectDB();
    } catch { /* fall through to the 503 below */ }
  }
  const passthrough = ['/', '/health', '/admin/verify'];
  if (mongoose.connection.readyState !== 1 && !passthrough.includes(req.path)) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable — database reconnecting. Try again shortly.'
    });
  }
  next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/workers', workerRoutes);
app.use('/clients', clientRoutes);
app.use('/admin', adminRoutes);

// Health check — also reports whether MONGODB_URI is even configured, so a
// 503 can be diagnosed from a browser without touching function logs:
//   database: "disconnected" + dbConfigured: false → env var missing/wrong name
//   database: "disconnected" + dbConfigured: true  → bad URI/credentials/cluster
app.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    message: 'KaamSetu API is running',
    uptime: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    dbConfigured: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'KaamSetu API',
    docs: 'https://github.com/Krishna-Vineet/Kaamsetu#readme'
  });
});

// ---------------------------------------------------------------------------
// 404 + central error handling (must stay last)
// ---------------------------------------------------------------------------
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);

  // CORS rejections are client errors, not server crashes.
  if (err.message && err.message.startsWith('Not allowed by CORS')) {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : 'Internal server error',
    error: isProduction ? undefined : err.message
  });
});

// ---------------------------------------------------------------------------
// Start server — skipped on serverless platforms (Vercel imports `app`)
// ---------------------------------------------------------------------------
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
if (!isServerless) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
