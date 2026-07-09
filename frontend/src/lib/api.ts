import { reportError } from '@/lib/observability'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);
    const requestId = crypto.randomUUID();
    headers.set('x-request-id', requestId);
    
    // Don't set Content-Type if body is FormData - browser will handle it with boundary
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let message = 'Something went wrong';
        try {
          const error = await response.json();
          message = Array.isArray(error.message)
            ? error.message.join(', ')
            : (error.message || message);
        } catch {
          // ignore JSON parse error on failed responses
        }

        const err = new Error(message);
        if (response.status >= 500) {
          reportError(err, {
            type: 'api.error',
            endpoint,
            status: response.status,
            requestId: response.headers.get('x-request-id') || requestId,
          });
        }
        throw err;
      }

      return response.json();
    } catch (error) {
      if (!(error instanceof Error) || error.message === 'Failed to fetch') {
        reportError(error, {
          type: 'api.network_error',
          endpoint,
          requestId,
        });
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    let requestBody = body;
    // Only JSON stringify if it's not FormData
    if (!(body instanceof FormData)) {
      requestBody = JSON.stringify(body);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: requestBody,
    });
  }

  async put<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    let requestBody = body;
    if (!(body instanceof FormData)) {
      requestBody = JSON.stringify(body);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: requestBody,
    });
  }

  async patch<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    let requestBody = body;
    if (!(body instanceof FormData)) {
      requestBody = JSON.stringify(body);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: requestBody,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService();
