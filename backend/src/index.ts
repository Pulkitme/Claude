/**
 * OURS App - Backend Server Entry Point
 * Main Express application setup and configuration
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes (will be created next)
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import pairRoutes from './routes/pairing';
import postRoutes from './routes/posts';
import calendarRoutes from './routes/calendar';
import listRoutes from './routes/lists';
import questionRoutes from './routes/questions';
import expenseRoutes from './routes/expenses';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// ===================
// Middleware Setup
// ===================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===================
// API Routes
// ===================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'OURS API is running',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// API version prefix
const apiRouter = express.Router();

// Mount route modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/pairing', pairRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/calendar', calendarRoutes);
apiRouter.use('/lists', listRoutes);
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/expenses', expenseRoutes);

// Mount API router
app.use(`/api/${API_VERSION}`, apiRouter);

// ===================
// Error Handling
// ===================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===================
// Server Initialization
// ===================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 OURS API Server Running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 API Version: ${API_VERSION}`);
      console.log(`🔗 URL: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
