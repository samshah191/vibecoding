import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { appRoutes } from './routes/apps';
import { aiRoutes } from './routes/ai';
// Temporarily disabled routes with Prisma dependencies
// import { communityRoutes } from './routes/community';
// import { socialRoutes } from './routes/social';
// import { leaderboardRoutes } from './routes/leaderboard';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Core Routes (Essential for VibeCoding platform)
app.use('/api/auth', authRoutes);
app.use('/api/apps', authenticateToken, appRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'VibeCoding Base44 Clone is running!',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'VibeCoding API',
    version: '1.0.0',
    description: 'AI-powered vibe coding platform - Base44 clone',
    status: 'Core features active, ready for deployment!',
    endpoints: {
      auth: '/api/auth',
      apps: '/api/apps',
      ai: '/api/ai',
      health: '/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

export { app };