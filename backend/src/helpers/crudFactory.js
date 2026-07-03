import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from './queryFeatures.js';

/**
 * Build standard CRUD controller handlers for a Mongoose model.
 * Handlers are plain async functions wrapped with asyncHandler, so they can
 * be dropped straight into routes and composed with auth/validation.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} options
 * @param {string[]} [options.allowedFilters]
 * @param {string[]} [options.searchFields]
 * @param {string}  [options.defaultSort]
 * @param {string[]} [options.populate]   paths to populate on read
 */
export const crudFactory = (Model, options = {}) => {
  const {
    allowedFilters = [],
    searchFields = [],
    defaultSort = '-createdAt',
    populate = [],
  } = options;

  const applyPopulate = (q) => populate.reduce((query, path) => query.populate(path), q);

  const list = asyncHandler(async (req, res) => {
    const { filter, sort, skip, limit, page } = buildQuery(req.query, {
      allowedFilters,
      searchFields,
      defaultSort,
    });
    // Merge any pre-scoped filter set by earlier middleware.
    const finalFilter = { ...(req.scopedFilter || {}), ...filter };

    const [items, total] = await Promise.all([
      applyPopulate(Model.find(finalFilter).sort(sort).skip(skip).limit(limit)).lean(),
      Model.countDocuments(finalFilter),
    ]);

    return sendOk(res, items, `${Model.modelName} list`, paginationMeta(total, page, limit));
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await applyPopulate(Model.findById(req.params.id)).lean();
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found.`);
    return sendOk(res, doc, `${Model.modelName} detail`);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    return sendCreated(res, doc, `${Model.modelName} created`);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found.`);
    return sendOk(res, doc, `${Model.modelName} updated`);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found.`);
    return sendOk(res, { id: req.params.id }, `${Model.modelName} deleted`);
  });

  return { list, getOne, create, update, remove };
};

export default crudFactory;
