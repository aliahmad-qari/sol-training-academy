/**
 * Shared query-feature builder for list endpoints.
 * Turns Express `req.query` into a safe Mongo { filter, sort, skip, limit, page }.
 *
 * Supported query params:
 *   ?page=1&limit=20            → pagination (limit capped at 100)
 *   ?sort=-createdAt,title      → multi-field sort (prefix "-" = descending)
 *   ?search=foo                 → case-insensitive OR-regex across searchFields
 *   ?<field>=value              → equality filter, only for allowedFilters
 *   ?<field>_gte / _lte / _gt / _lt / _ne → range/comparison operators
 *
 * @param {object} query   req.query
 * @param {object} opts
 * @param {string[]} [opts.allowedFilters=[]]  fields that may be filtered
 * @param {string[]} [opts.searchFields=[]]    fields included in text search
 * @param {string}  [opts.defaultSort='-createdAt']
 * @param {number}  [opts.maxLimit=100]
 */
export const buildQuery = (query = {}, opts = {}) => {
  const {
    allowedFilters = [],
    searchFields = [],
    defaultSort = '-createdAt',
    maxLimit = 500,
  } = opts;

  // --- Pagination ---
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // --- Sorting ---
  let sort = defaultSort;
  if (query.sort && typeof query.sort === 'string') {
    sort = query.sort.split(',').map((s) => s.trim()).filter(Boolean).join(' ');
  }

  // --- Filtering (equality + comparison operators) ---
  const filter = {};
  const OPS = { gte: '$gte', lte: '$lte', gt: '$gt', lt: '$lt', ne: '$ne' };

  for (const field of allowedFilters) {
    // exact match
    if (query[field] !== undefined && query[field] !== '') {
      const raw = query[field];
      // support comma list → $in
      if (typeof raw === 'string' && raw.includes(',')) {
        filter[field] = { $in: raw.split(',').map((v) => v.trim()) };
      } else if (raw === 'true' || raw === 'false') {
        filter[field] = raw === 'true';
      } else {
        filter[field] = raw;
      }
    }
    // comparison operators (e.g. price_gte=100)
    for (const [suffix, mongoOp] of Object.entries(OPS)) {
      const key = `${field}_${suffix}`;
      if (query[key] !== undefined && query[key] !== '') {
        const num = Number(query[key]);
        filter[field] = filter[field] && typeof filter[field] === 'object' ? filter[field] : {};
        filter[field][mongoOp] = Number.isFinite(num) ? num : query[key];
      }
    }
  }

  // --- Search ---
  if (query.search && searchFields.length > 0) {
    const term = String(query.search).trim();
    if (term) {
      // Escape regex special chars to avoid ReDoS / injection.
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = searchFields.map((f) => ({ [f]: { $regex: safe, $options: 'i' } }));
    }
  }

  return { filter, sort, skip, limit, page };
};

/**
 * Convenience: standard pagination meta object.
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit) || 1,
});

export default buildQuery;
