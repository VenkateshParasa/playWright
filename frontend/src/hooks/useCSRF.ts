/**
 * CSRF Token Hook
 * Manage CSRF tokens for form submissions
 */

import { useState, useEffect, useCallback } from 'react';

interface CsrfState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage CSRF tokens
 */
export const useCSRF = () => {
  const [state, setState] = useState<CsrfState>({
    token: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch CSRF token from server
   */
  const fetchCsrfToken = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();

      setState({
        token: data.csrfToken,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch CSRF token',
      });
    }
  }, []);

  /**
   * Get CSRF token from cookie
   */
  const getCsrfFromCookie = useCallback((): string | null => {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }

    return null;
  }, []);

  /**
   * Refresh CSRF token
   */
  const refreshToken = useCallback(async () => {
    await fetchCsrfToken();
  }, [fetchCsrfToken]);

  /**
   * Get headers with CSRF token
   */
  const getHeaders = useCallback(
    (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders,
      };

      if (state.token) {
        headers['X-CSRF-TOKEN'] = state.token;
      }

      return headers;
    },
    [state.token]
  );

  /**
   * Make authenticated request with CSRF token
   */
  const makeRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = state.token || getCsrfFromCookie();

      if (!token && options.method !== 'GET') {
        // Fetch token if not available
        await fetchCsrfToken();
      }

      const headers = new Headers(options.headers);
      headers.set('Content-Type', 'application/json');

      if (token) {
        headers.set('X-CSRF-TOKEN', token);
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    },
    [state.token, getCsrfFromCookie, fetchCsrfToken]
  );

  // Fetch token on mount
  useEffect(() => {
    // Check if token exists in cookie first
    const cookieToken = getCsrfFromCookie();

    if (cookieToken) {
      setState({
        token: cookieToken,
        loading: false,
        error: null,
      });
    } else {
      fetchCsrfToken();
    }
  }, [fetchCsrfToken, getCsrfFromCookie]);

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    refreshToken,
    getHeaders,
    makeRequest,
  };
};

/**
 * Higher-order component to provide CSRF protection
 */
export const withCSRF = <P extends object>(
  Component: React.ComponentType<P & { csrf: ReturnType<typeof useCSRF> }>
) => {
  return (props: P) => {
    const csrf = useCSRF();
    return <Component {...props} csrf={csrf} />;
  };
};
