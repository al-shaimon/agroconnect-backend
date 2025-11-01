import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from './config/config.js';
import routes from './app/routes.js';
import { errorHandler, notFound } from './app/middlewares/error.middleware.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Log environment info
console.log('Environment:', process.env.NODE_ENV);
console.log('Vercel:', process.env.VERCEL ? 'Yes' : 'No');

// Middleware
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware to ensure DB connection for serverless environments
app.use(async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AgroConnect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
