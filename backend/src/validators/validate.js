import { ApiError } from '../utils/ApiError.js';

/**
 * Tiny schema-runner. Each validator module exports a function that takes the
 * request body and returns { value, errors }. This middleware factory runs it,
 * throws a 422 with details on failure, and replaces req.body with the
 * cleaned value on success.
 *
 * Keeping validation dependency-light (using `validator`) avoids pulling a
 * large schema lib while still giving structured, per-field errors.
 */
export const runValidator = (validatorFn) => (req, res, next) => {
  const { value, errors } = validatorFn(req.body || {});
  if (errors && errors.length > 0) {
    return next(ApiError.unprocessable('Validation failed', errors));
  }
  req.body = value;
  return next();
};

/**
 * Small assertion helpers used inside validator modules.
 */
export const fieldError = (field, message) => ({ field, message });

export default runValidator;
