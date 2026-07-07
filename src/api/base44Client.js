/**
 * base44Client.js — REAL ADAPTER (Base44 fully removed)
 *
 * Base44 has been decommissioned. This module used to be a dead no-op stub;
 * it is now a thin compatibility adapter that maps the old Base44 surface
 * (`base44.auth.*`, `base44.entities.*`, `base44.integrations.Core.*`) onto the
 * custom SOL Training Academy Express backend via `apiClient`.
 *
 * This lets the ~90 components that still `import { base44 }` keep working
 * unchanged while talking to the real API. New code should prefer importing
 * `apiClient` / `uploadFile` / `useAuth` directly.
 *
 * ── Entity contract (unchanged from Base44) ──────────────────────────────────
 *   Entity.list(sort?)                → Promise<Array>
 *   Entity.filter(criteria?, sort?)   → Promise<Array>
 *   Entity.get(id)                    → Promise<Object>
 *   Entity.create(data)               → Promise<Object>
 *   Entity.update(id, data)           → Promise<Object>
 *   Entity.delete(id)                 → Promise<Object>
 *   Entity.bulkCreate(items)          → Promise<Array>
 * Records are normalized so `record.id` always exists (mapped from Mongo `_id`).
 *
 * Entities without a backend yet (leftovers from Base44 / the deleted Client
 * Portal) degrade gracefully: reads resolve to [] and writes reject with a
 * clear "not available" error instead of silently no-op'ing.
 */
import apiClient from '@/api/apiClient';
import { uploadFile as uploadToCloudinary } from '@/api/uploadClient';
import { extractDocument } from '@/api/aiClient';

/* ───────────────────────── helpers ───────────────────────── */

const unwrap = (res) => res?.data?.data;

/** Ensure every record exposes `.id` (frontend relies on it) alongside `_id`. */
const normalize = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;
  if (doc._id && doc.id === undefined) doc.id = String(doc._id);
  // Base44 code often reads `created_date`; backend uses Mongoose `createdAt`.
  if (doc.createdAt && doc.created_date === undefined) doc.created_date = doc.createdAt;
  if (doc.updatedAt && doc.updated_date === undefined) doc.updated_date = doc.updatedAt;
  return doc;
};
const normalizeList = (arr) => (Array.isArray(arr) ? arr.map(normalize) : []);

/**
 * Base44 sort string → backend `sort` query param.
 * Base44: "field" (asc) or "-field" (desc). Backend uses the same convention.
 */
const toSortParam = (sort) => (typeof sort === 'string' && sort.trim() ? sort.trim() : undefined);

/* ───────────────────── generic REST entity ───────────────────── */

/**
 * Build a CRUD entity bound to a REST resource path (e.g. "/courses").
 * `opts` allows per-entity overrides for the non-uniform routes.
 */
function restEntity(basePath, opts = {}) {
  const {
    // Some list endpoints want a high limit to emulate Base44's "return all".
    listLimit = 500,
    // Override the create/read/etc. behavior where routes differ.
    overrides = {},
  } = opts;

  const api = {
    async list(sort) {
      const params = { limit: listLimit };
      const s = toSortParam(sort);
      if (s) params.sort = s;
      const res = await apiClient.get(basePath, { params });
      return normalizeList(unwrap(res));
    },

    async filter(criteria = {}, sort) {
      const params = { limit: listLimit, ...criteria };
      const s = toSortParam(sort);
      if (s) params.sort = s;
      const res = await apiClient.get(basePath, { params });
      return normalizeList(unwrap(res));
    },

    async get(id) {
      const res = await apiClient.get(`${basePath}/${id}`);
      return normalize(unwrap(res));
    },

    async create(data) {
      const res = await apiClient.post(basePath, data);
      return normalize(unwrap(res));
    },

    async update(id, data) {
      const method = opts.updateMethod || 'put';
      const res = await apiClient[method](`${basePath}/${id}`, data);
      return normalize(unwrap(res));
    },

    async delete(id) {
      const res = await apiClient.delete(`${basePath}/${id}`);
      return unwrap(res) || { id };
    },

    async bulkCreate(items = []) {
      const created = [];
      for (const item of items) created.push(await api.create(item));
      return created;
    },

    /**
     * Bulk reorder — persist a new ordering in a SINGLE request.
     * `items`: [{ id, sort_order, module_id? }, ...]
     * Hits PATCH `${basePath}/reorder`; the backend does one bulkWrite and
     * returns the freshly ordered records ({ modules } or { topics }).
     */
    async reorder(items = []) {
      if (!Array.isArray(items) || items.length === 0) return [];
      const res = await apiClient.patch(`${basePath}/reorder`, { items });
      const data = unwrap(res) || {};
      // Controllers return { modules } (modules) or { topics } (topics).
      const list = data.modules || data.topics || [];
      return normalizeList(list);
    },
  };

  return { ...api, ...overrides };
}

/**
 * A stand-in for entities that have no backend yet. Reads succeed (empty) so
 * dashboards render; writes fail loudly so the gap is obvious in dev.
 */
function unavailableEntity(name) {
  const emptyList = async () => [];
  const reject = async () => {
    throw new Error(
      `[base44 adapter] The "${name}" entity has no backend endpoint yet. ` +
        `This feature is not available until a corresponding API is implemented.`
    );
  };
  return {
    list: emptyList,
    filter: emptyList,
    get: async () => null,
    create: reject,
    update: reject,
    delete: reject,
    bulkCreate: reject,
    __unavailable: true,
  };
}

/* ───────────────────── entity registry ───────────────────── */

// Entities with a real backend (models + routes verified in backend/src).
const entities = {
  User: restEntity('/users', { updateMethod: 'patch' }),
  Course: restEntity('/courses'),
  CourseModule: restEntity('/modules'),
  CourseTopic: restEntity('/topics'),
  Quiz: restEntity('/quizzes'),
  Assignment: restEntity('/assignments'),
  Certificate: restEntity('/certificates'),
  CoursePayment: restEntity('/payments'),
  Coupon: restEntity('/coupons'),
  SupportTicket: restEntity('/support-tickets', { updateMethod: 'patch' }),

  // Enrollments: staff use /enrollments; a student self-enrolling must hit
  // /student/enroll (RBAC on /enrollments POST is staff-only).
  CourseEnrollment: restEntity('/enrollments', {
    updateMethod: 'patch',
    overrides: {
      async create(data) {
        // If the caller is enrolling themselves, use the student endpoint.
        try {
          const res = await apiClient.post('/enrollments', data);
          return normalize(unwrap(res));
        } catch (err) {
          if (err.response?.status === 403 && data.course_id) {
            const res = await apiClient.post('/student/enroll', {
              course_id: data.course_id,
            });
            return normalize(unwrap(res));
          }
          throw err;
        }
      },
    },
  }),

  // Quiz attempts live under /quizzes/attempts (create) & /attempts/mine (read).
  QuizAttempt: {
    async list() {
      const res = await apiClient.get('/quizzes/attempts/mine', { params: { limit: 500 } });
      return normalizeList(unwrap(res));
    },
    async filter(criteria = {}) {
      // Staff can pass user_id/course_id; try the admin listing, fall back to mine.
      try {
        const res = await apiClient.get('/quizzes/attempts', { params: { limit: 500, ...criteria } });
        return normalizeList(unwrap(res));
      } catch {
        const res = await apiClient.get('/quizzes/attempts/mine', { params: { limit: 500 } });
        return normalizeList(unwrap(res)).filter((a) =>
          Object.entries(criteria).every(([k, v]) => String(a[k]) === String(v))
        );
      }
    },
    async create(data) {
      const res = await apiClient.post('/quizzes/attempts', data);
      return normalize(unwrap(res));
    },
    async get() { return null; },
    async update() { throw new Error('QuizAttempt records are immutable.'); },
    async delete() { throw new Error('QuizAttempt records cannot be deleted.'); },
    async bulkCreate() { throw new Error('Not supported.'); },
  },

  // Assignment submissions: create supports the two-step upload (file already
  // on Cloudinary → send file_url) as well as staff grading via update (PATCH).
  AssignmentSubmission: restEntity('/submissions', {
    updateMethod: 'patch',
    overrides: {
      async update(id, data) {
        // The backend exposes grading at /submissions/:id/grade.
        const res = await apiClient.patch(`/submissions/${id}/grade`, data);
        return normalize(unwrap(res));
      },
    },
  }),
};

// Orphaned entities (no backend yet): leftovers from Base44 / deleted Client
// Portal. Listed explicitly so a typo elsewhere surfaces as undefined, not a
// silent stub. Implement a backend + move into `entities` above to enable.
const ORPHANED = [
  'Enquiry', 'StudentDocument', 'StudentRequest', 'StudentNote', 'StudentGoal',
  'CourseFeedback', 'DiscussionPost', 'CourseWaitlist', 'Referral',
  'TeamMember', 'TeamFile', 'TeamActivityLog',
  'Subscription', 'EmailSequence', 'AutomationLog',
  'Complaint', 'ReadinessQuizLead', 'Document', 'Invoice',
];
for (const name of ORPHANED) entities[name] = unavailableEntity(name);

/* ───────────────────── auth surface ───────────────────── */

const auth = {
  async me() {
    const res = await apiClient.get('/auth/me');
    return normalize(res?.data?.data?.user);
  },
  async isAuthenticated() {
    if (!localStorage.getItem('sol_access_token')) return false;
    try {
      await apiClient.get('/auth/me');
      return true;
    } catch {
      return false;
    }
  },
  async updateMe(data) {
    const res = await apiClient.patch('/users/me', data);
    return normalize(unwrap(res));
  },
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('sol_access_token');
    }
  },
  redirectToLogin(redirect) {
    window.location.href = `/login?from=${encodeURIComponent(redirect || '/')}`;
  },
  setToken(token) {
    if (token) localStorage.setItem('sol_access_token', token);
    else localStorage.removeItem('sol_access_token');
  },
  // No backend endpoints for these yet — surface a clear message.
  async resetPasswordRequest() {
    throw new Error('Password reset is not available yet.');
  },
  async resetPassword() {
    throw new Error('Password reset is not available yet.');
  },
  // Legacy login helpers — the app now logs in via useAuth()/AuthContext.
  async loginViaEmailPassword({ email, password } = {}) {
    const res = await apiClient.post('/auth/login', { email, password });
    const token = res?.data?.data?.accessToken;
    if (token) localStorage.setItem('sol_access_token', token);
    return normalize(res?.data?.data?.user);
  },
};

/* ───────────────── integrations.Core surface ───────────────── */

const Core = {
  /**
   * UploadFile({ file }) → { file_url }.
   * Streams to Cloudinary through the backend. Kind is inferred loosely; most
   * callers just want a URL back, so we default to a generic resource upload.
   */
  async UploadFile({ file, kind } = {}) {
    // Pick a sensible default kind based on the file type when not specified.
    let inferred = kind;
    if (!inferred) {
      if (file?.type?.startsWith('video/')) inferred = 'video';
      else if (file?.type?.startsWith('image/')) inferred = 'resource';
      else inferred = 'resource';
    }
    try {
      const result = await uploadToCloudinary({ file, kind: inferred });
      return { file_url: result.file_url, ...result };
    } catch (err) {
      // Students may lack staff permission for /uploads/:kind — retry on the
      // student-safe route with a document kind.
      if (err.response?.status === 403) {
        const result = await uploadToCloudinary({ file, kind: 'document' });
        return { file_url: result.file_url, ...result };
      }
      throw err;
    }
  },

  // Email has no backend equivalent yet — fail clearly rather than pretend.
  async SendEmail() {
    throw new Error('Email sending is not available (no backend email integration yet).');
  },

  /**
   * DEPRECATED. AI now runs through dedicated, server-side feature routes
   * (see `@/api/aiClient` → runStudentTool / runAdminTool). The old
   * "send an arbitrary prompt + schema" surface is intentionally gone so no
   * caller can ship raw prompts from the browser. Kept only to surface a clear
   * error if any legacy code path still references it.
   */
  async InvokeLLM() {
    throw new Error(
      'InvokeLLM is deprecated. Use the AI tool routes via @/api/aiClient (runStudentTool / runAdminTool).'
    );
  },

  /**
   * ExtractDataFromUploadedFile({ file_url, mimeType }) → { status, output: { text } }.
   * Preserves the original base44 contract (status 'success'|'error', output.text)
   * so the assignment upload tools consume it unchanged. Backed by Gemini
   * multimodal extraction on the server (POST /ai/extract).
   */
  async ExtractDataFromUploadedFile({ file_url, mimeType } = {}) {
    try {
      const { text } = await extractDocument({ file_url, mimeType });
      return { status: 'success', output: { text } };
    } catch (err) {
      return {
        status: 'error',
        error: err?.response?.data?.message || err?.message || 'Extraction failed.',
      };
    }
  },
};

/* ───────────────────── public export ───────────────────── */

export const base44 = {
  auth,
  entities,
  integrations: { Core },
};

export default base44;
