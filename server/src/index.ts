import { app } from './app';
import http from 'http';
import { ensureDatabaseSetup, DatabaseSetupResult } from './services/databaseSetupService';

const PORT = process.env.PORT || 5000;

async function startServer() {
  let setupResult: DatabaseSetupResult | undefined;

  try {
    setupResult = await ensureDatabaseSetup();
  } catch (error) {
    console.error('Failed to prepare database schema:', error);
    process.exit(1);
  }

  try {
    console.log('✅ Database connected successfully');
    if (setupResult?.executed) {
      console.log(`🔄 Prisma schema applied via ${setupResult.appliedCommand}`);
    }

    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      console.log(`🚀 VibeCoding server running on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log('✨ Server ready for connections');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
