import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import { logger } from './logger.js';

/**
 * One-time migration: grandfather existing accounts as verified.
 * Run: `npm run migrate:verified`
 *
 * Email verification (is_verified) was added after launch. Without this,
 * every pre-existing user — including admins — would be treated as unverified
 * and blocked at login. This sets is_verified:true for any account that
 * predates the field (i.e. where it is missing or false-by-backfill).
 *
 * Idempotent: safe to run multiple times. Only touches docs where the field is
 * absent, so genuinely-unverified NEW sign-ups (created with is_verified:false
 * explicitly) are left alone.
 */
const run = async () => {
  await connectDB();

  const result = await User.updateMany(
    { is_verified: { $exists: false } },
    { $set: { is_verified: true } }
  );

  logger.info(
    `Backfill complete: ${result.modifiedCount} existing user(s) marked verified.`
  );

  await disconnectDB();
  process.exit(0);
};

run().catch(async (err) => {
  logger.error(`Backfill failed: ${err.message}`);
  await disconnectDB();
  process.exit(1);
});
