/**
 * Recursively ensure every object that carries a Mongo `_id` also exposes a
 * string `id` field.
 *
 * WHY: list/detail controllers use Mongoose `.lean()` for performance, which
 * returns plain POJOs and does NOT run the schema's `id` virtual. The frontend
 * (Student Portal in particular, which talks to the raw axios client without
 * the base44 normalizer) matches records by `.id` — e.g.
 * `topics.filter(t => t.module_id === mod.id)`. Without this, `mod.id` is
 * `undefined` and the curriculum tree renders empty, active topics never
 * resolve, and completion checkmarks break.
 *
 * Design notes:
 *  - Non-destructive: only sets `id` when it is missing; never overwrites an
 *    existing `id` (so hydrated docs / virtuals are respected).
 *  - Depth-first walk over arrays and nested objects so embedded curricula
 *    (e.g. course.modules[].topics[]) are covered.
 *  - Skips Date/Buffer/ObjectId leaf types to avoid mangling them.
 *  - Cycle-guarded via a WeakSet (defensive — API payloads are trees, but a
 *    self-referential object would otherwise loop forever).
 */
const attachIds = (value, seen) => {
  if (value === null || typeof value !== 'object') return value;

  // Leaf object types we must not treat as plain records.
  if (value instanceof Date || Buffer.isBuffer(value)) return value;

  if (seen.has(value)) return value;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) attachIds(item, seen);
    return value;
  }

  // A bare ObjectId serializes via its own toJSON — leave it alone.
  if (typeof value._bsontype === 'string') return value;

  if (value._id != null && value.id === undefined) {
    // _id may be an ObjectId, string, or (rarely) a nested doc — String() is safe.
    value.id = String(value._id);
  }

  for (const key of Object.keys(value)) {
    if (key === '_id' || key === 'id') continue;
    attachIds(value[key], seen);
  }
  return value;
};

/**
 * Standard success envelope used by every controller so the frontend
 * always receives a predictable shape:
 *
 *   { success: true, message, data, meta? }
 *
 * `meta` carries pagination info when present. `data` is normalized so every
 * record with an `_id` also carries a string `id` (see attachIds above).
 */
export const sendResponse = (res, statusCode, { message = 'OK', data = null, meta = undefined } = {}) => {
  const payload = { success: true, message, data: attachIds(data, new WeakSet()) };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = 'Created successfully') =>
  sendResponse(res, 201, { message, data });

export const sendOk = (res, data, message = 'OK', meta) =>
  sendResponse(res, 200, { message, data, meta });

export default sendResponse;
