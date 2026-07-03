/**
 * base44Client.js — STUB
 *
 * The Base44 SDK has been removed. This file is a compatibility stub so that
 * pages not yet migrated don't crash on import. Each page should be
 * progressively updated to use apiClient.js instead.
 *
 * base44.auth.*       → use useAuth() from @/lib/AuthContext
 * base44.entities.*   → use apiClient from @/api/apiClient
 */

const noop = () => Promise.resolve(null);
const noopObj = new Proxy({}, { get: () => noopObj, apply: () => Promise.resolve(null) });

export const base44 = {
  auth: {
    me: noop,
    login: noop,
    logout: noop,
    register: noop,
    loginViaEmailPassword: noop,
    loginWithProvider: noop,
    redirectToLogin: (redirect) => { window.location.href = `/login?from=${encodeURIComponent(redirect || '/')}`; },
    isAuthenticated: () => Promise.resolve(false),
    resetPasswordRequest: noop,
    resetPassword: noop,
    setToken: noop,
  },
  entities: noopObj,
  integrations: noopObj,
};

export default base44;
