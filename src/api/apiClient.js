/**
 * Central Axios instance for all requests to the SOL Training Academy backend.
 *
 * - Reads/writes the access token from localStorage.
 * - Auto-retries a 401 once by calling /auth/refresh (which rotates the
 *   httpOnly refresh cookie), then replays the original request.
 * - On a second 401 (refresh also expired) it clears local state and
 *   redirects to /login.
 */
import axios from 'axios';

// In production (Vercel) set VITE_API_URL=https://sol-training-academy.onrender.com/api/v1
// Locally the Vite proxy forwards /api/v1 → localhost:5000, so the relative fallback works.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,          // send the httpOnly sol_refresh cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor — attach access token ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sol_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — silent token refresh on 401 ──────────────────────
let isRefreshing = false;
let refreshQueue = [];              // queued requests waiting for the new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that haven't already been retried.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh resolves.
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch(Promise.reject.bind(Promise));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await apiClient.post('/auth/refresh');
      const newToken = data.data.accessToken;
      localStorage.setItem('sol_access_token', newToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('sol_access_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
