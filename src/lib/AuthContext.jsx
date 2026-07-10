/**
 * AuthContext for SOL Training Academy — custom backend.
 *
 * Manages user login state, fetches the current user via /auth/me, and provides
 * logout with server-side refresh token revocation.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '@/api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  /**
   * On mount, attempt to fetch /auth/me if a token is stored.
   * The apiClient auto-refreshes if needed.
   */
  const checkUserAuth = async () => {
    const token = localStorage.getItem('sol_access_token');
    if (!token) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('sol_access_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  /**
   * Login: POST /auth/login, store access token, fetch user.
   * Returns { success: boolean, error?: string }
   */
  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { user: loggedInUser, accessToken } = data.data;
      localStorage.setItem('sol_access_token', accessToken);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return { success: true, role: loggedInUser.role };
    } catch (error) {
      // An unverified account returns 403 with a pending_verification flag so
      // the UI can route to the OTP screen instead of showing a hard error.
      const details = error.response?.data?.details;
      if (details?.pending_verification) {
        return { success: false, pendingVerification: true, email: details.email || email };
      }
      const msg =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    }
  };

  /**
   * Register: POST /auth/register.
   * New accounts are unverified — the backend emails a 6-digit OTP and returns
   * a pending-verification state (no token issued). The caller redirects to the
   * /verify-otp screen with the returned email.
   * Returns { success, pendingVerification?, email?, error? }
   */
  const register = async (full_name, email, password, phone) => {
    try {
      const { data } = await apiClient.post('/auth/register', {
        full_name,
        email,
        password,
        phone,
      });
      return {
        success: true,
        pendingVerification: true,
        email: data.data?.email || email,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.details?.[0]?.message ||
        'Registration failed. Please try again.';
      return { success: false, error: msg };
    }
  };

  /**
   * Verify OTP: POST /auth/verify-otp. On success, stores the access token and
   * logs the user in (mirrors `login`).
   * Returns { success, role?, error? }
   */
  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
      const { user: verifiedUser, accessToken } = data.data;
      localStorage.setItem('sol_access_token', accessToken);
      setUser(verifiedUser);
      setIsAuthenticated(true);
      return { success: true, role: verifiedUser.role };
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Invalid or expired code. Please try again.';
      return { success: false, error: msg };
    }
  };

  /**
   * Resend OTP: POST /auth/resend-otp. Always resolves (no enumeration).
   * Returns { success, error? }
   */
  const resendOtp = async (email) => {
    try {
      await apiClient.post('/auth/resend-otp', { email });
      return { success: true };
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Could not resend the code. Please try again.';
      return { success: false, error: msg };
    }
  };

  /**
   * Logout: POST /auth/logout (revokes refresh token), clear local state.
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('sol_access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
