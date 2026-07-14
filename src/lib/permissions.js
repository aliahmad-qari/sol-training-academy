/**
 * permissions.js — single source of truth for module-level RBAC on the frontend.
 *
 * The backend User schema stores a granular `page_permissions: [pageId]` array
 * (page ids match NAV_SECTIONS in LMSAdmin.jsx). To keep the invite UX simple,
 * admins pick a small set of COARSE module buckets (accessStudents, accessCourses,
 * accessFinance, accessSupport, …); each bucket expands to the underlying page ids
 * here. This lets us honour the "checkbox permissions" UX while persisting the
 * one canonical format the sidebar + Access-Denied guard already enforce.
 *
 * NOTE: `dashboard` is intentionally NOT part of any bucket — it is granted to
 * every team member as a baseline landing page (see BASELINE_PAGES).
 */

// Pages every team member gets regardless of buckets — they need somewhere to land.
export const BASELINE_PAGES = ['dashboard'];

/**
 * Coarse permission buckets shown as checkboxes in the invite/edit UI.
 * `pages` are the granular page ids each bucket unlocks.
 * Keys mirror the task spec (accessStudents/Courses/Finance/Support) plus a few
 * extra buckets so the full admin surface is reachable via presets.
 */
export const PERMISSION_BUCKETS = [
  {
    key: 'accessStudents',
    label: 'Students',
    description: 'Student management, access & expiry, certificates',
    pages: ['students', 'expiry', 'certificates', 'gradebook'],
  },
  {
    key: 'accessCourses',
    label: 'Courses & Content',
    description: 'Courses, modules, videos, quizzes, assessments',
    pages: ['courses', 'modules', 'videos', 'quizzes', 'assessments'],
  },
  {
    key: 'accessFinance',
    label: 'Finance',
    description: 'Revenue, payments, coupons',
    pages: ['revenue', 'payments', 'coupons'],
  },
  {
    key: 'accessSupport',
    label: 'Support',
    description: 'Support tickets & student requests',
    pages: ['support', 'requests'],
  },
  {
    key: 'accessContentOps',
    label: 'Platform Content',
    description: 'Resources, announcements, waitlist, referrals',
    pages: ['resources', 'announcements', 'waitlist', 'referrals'],
  },
  {
    key: 'accessAnalytics',
    label: 'Analytics & Export',
    description: 'Reports, analytics & CSV export',
    pages: ['analytics', 'export'],
  },
];

/**
 * Expand a coarse permission object → the flat page_permissions array to persist.
 * @param {Record<string, boolean>} buckets e.g. { accessStudents: true }
 * @returns {string[]} unique page ids (baseline pages always included)
 */
export const bucketsToPages = (buckets = {}) => {
  const pages = new Set(BASELINE_PAGES);
  for (const bucket of PERMISSION_BUCKETS) {
    if (buckets[bucket.key]) bucket.pages.forEach((p) => pages.add(p));
  }
  return [...pages];
};

/**
 * Reverse mapping: infer which buckets are (fully) enabled from a page list.
 * A bucket is considered "on" if ALL of its pages are present — used to
 * pre-tick checkboxes when editing an existing member.
 * @param {string[]} pages
 * @returns {Record<string, boolean>}
 */
export const pagesToBuckets = (pages = []) => {
  const set = new Set(pages);
  const out = {};
  for (const bucket of PERMISSION_BUCKETS) {
    out[bucket.key] = bucket.pages.every((p) => set.has(p));
  }
  return out;
};

/**
 * Does this authenticated user have access to a given page id?
 * - admins: full access (page_permissions ignored).
 * - team_member: must have the page in page_permissions (baseline always allowed).
 * - anyone else: no admin pages.
 */
export const canAccessPage = (user, pageId) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'team_member') return false;
  if (BASELINE_PAGES.includes(pageId)) return true;
  return (user.page_permissions || []).includes(pageId);
};

/**
 * The set of page ids a user may see, or `null` meaning "no restriction" (admin).
 * `null` is the sentinel LMSAdmin's sidebar already understands.
 */
export const allowedPageIdsFor = (user) => {
  if (!user) return [];
  if (user.role === 'admin') return null; // null = unrestricted
  if (user.role !== 'team_member') return [];
  return [...new Set([...BASELINE_PAGES, ...(user.page_permissions || [])])];
};
