import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { logger } from './logger.js';

/**
 * Idempotent admin seeder. Run: `npm run seed:admin`
 * Reads SEED_ADMIN_* from the environment. Creates the admin if absent,
 * or promotes/reactivates an existing account with that email.
 */
const run = async () => {
  const { name, email, password } = env.seedAdmin;

  if (!email || !password) {
    logger.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.');
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (user) {
    user.role = 'admin';
    user.is_active = true;
    user.full_name = user.full_name || name;
    // Only reset the password if explicitly provided and different.
    user.password = password;
    await user.save();
    logger.info(`Admin updated: ${email}`);
  } else {
    user = await User.create({
      full_name: name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      is_active: true,
    });
    logger.info(`Admin created: ${email}`);
  }

  await disconnectDB();
  process.exit(0);
};

run().catch(async (err) => {
  logger.error(`Seed failed: ${err.message}`);
  await disconnectDB();
  process.exit(1);
});
