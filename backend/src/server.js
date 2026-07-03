import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

/**
 * Application entrypoint.
 * 1. Connect to MongoDB (with retries).
 * 2. Start the HTTP server.
 * 3. Register graceful shutdown + process-level crash guards.
 */

let server;

const start = async () => {
  try {
    await connectDB();

    server = http.createServer(app);

    server.listen(env.port, () => {
      logger.info(`🚀 SOL Training Academy API listening on port ${env.port} [${env.nodeEnv}]`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${env.port} is already in use.`);
      } else {
        logger.error(`HTTP server error: ${err.message}`);
      }
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// --------------------------------------------------------------------------
//  Graceful shutdown
// --------------------------------------------------------------------------
const shutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed.');
    }
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    logger.error(`Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});

// --------------------------------------------------------------------------
//  Crash guards — log then exit so the platform can restart the process.
// --------------------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});

start();
