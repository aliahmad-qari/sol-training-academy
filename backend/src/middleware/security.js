import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

/**
 * Recursively sanitize a value against stored-XSS by stripping HTML/JS.
 * Applied to strings only; objects/arrays are walked in place.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {}, // allow no tags
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeValue(value[key]);
    }
    return value;
  }
  return value;
};

/**
 * XSS protection middleware — cleans req.body and req.params.
 * (Query string is read-only in Express 5, so we don't mutate it.)
 */
export const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

/**
 * MongoDB operator injection protection.
 * Strips keys containing "$" or "." from body/params so an attacker
 * cannot inject query operators like { "$gt": "" }.
 *
 * We call the sanitizer directly on each object (instead of using it as
 * top-level middleware) because express-mongo-sanitize v2 tries to reassign
 * req.query, which throws on Express 5's read-only getter.
 */
export const mongoSanitizer = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  next();
};

export default { xssSanitizer, mongoSanitizer };
