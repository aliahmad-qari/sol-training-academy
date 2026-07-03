/**
 * Wraps an async Express route handler so any rejected promise is
 * forwarded to `next()` and handled by the global error middleware.
 * Removes the need for try/catch in every controller.
 *
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
