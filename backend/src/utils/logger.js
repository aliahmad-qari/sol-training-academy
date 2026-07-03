/**
 * Minimal structured logger. Kept dependency-free so it works on any host.
 * Swap for pino/winston later without touching call sites.
 */
const ts = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log(`[${ts()}] [info]`, ...args),
  warn: (...args) => console.warn(`[${ts()}] [warn]`, ...args),
  error: (...args) => console.error(`[${ts()}] [error]`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') console.debug(`[${ts()}] [debug]`, ...args);
  },
};

export default logger;
