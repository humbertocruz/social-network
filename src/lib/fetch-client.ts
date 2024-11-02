// src/lib/fetch-client.ts
type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
};

export async function fetchClient(url: string, options: FetchOptions = {}) {
  try {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (response.status >= 400) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}