import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Production-ready MongoDB (Atlas) connection using Mongoose.
 *
 * - Uses a pooled connection sized for a small/medium Render/Railway dyno.
 * - Retries the initial connection a few times (Atlas can be slow to accept
 *   the first connection on cold clusters / free tier).
 * - Wires up connection event logging and graceful shutdown.
 */

// `strictQuery: true` avoids silently ignoring unknown query fields.
mongoose.set('strictQuery', true);

const CONNECT_OPTIONS = {
  // Server selection + socket timeouts tuned for cloud hosting.
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  // Connection pool.
  maxPoolSize: 20,
  minPoolSize: 2,
  // Keep the app responsive if Mongo is unreachable.
  family: 4,
  autoIndex: !env.isProd, // build indexes automatically only outside production
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let isConnected = false;

export const connectDB = async ({ retries = 5, delayMs = 3000 } = {}) => {
  if (isConnected) return mongoose.connection;

  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not defined. Cannot connect to database.');
  }

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(env.mongoUri, CONNECT_OPTIONS);
      isConnected = true;
      // eslint-disable-next-line no-console
      console.log(`[db] MongoDB connected → host: ${conn.connection.host} db: ${conn.connection.name}`);
      return conn.connection;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[db] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt >= retries) {
        throw new Error(`Could not connect to MongoDB after ${retries} attempts: ${error.message}`);
      }
      await wait(delayMs);
    }
  }
};

// --- Connection lifecycle logging ------------------------------------------
mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log('[db] Mongoose connection established.');
});

mongoose.connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(`[db] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  // eslint-disable-next-line no-console
  console.warn('[db] Mongoose disconnected.');
});

/**
 * Close the connection cleanly (used on SIGINT/SIGTERM).
 */
export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.connection.close(false);
  isConnected = false;
  // eslint-disable-next-line no-console
  console.log('[db] Mongoose connection closed.');
};

export default connectDB;
