import { API_ROOT } from '@/api/config';
import { clearToken, getToken } from '@/api/session';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Envelope<T> = {
  status?: number;
  message?: string;
  data?: T;
  errorMessage?: string;
  error?: string;
};

type Options = RequestInit & { auth?: boolean };

/** JSON request against the Mpuza API. Throws ApiError; never throws a raw network TypeError. */
export async function api<T>(path: string, options: Options = {}): Promise<Envelope<T>> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Could not reach Mpuza. Check your connection and try again.', 0);
  }

  const text = await response.text();
  let body: Envelope<T> = {};
  if (text) {
    try {
      body = JSON.parse(text) as Envelope<T>;
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false && !path.startsWith('/auth/signin')) {
      await clearToken();
    }
    throw new ApiError(body.errorMessage || 'Something went wrong.', response.status, body.error);
  }

  return body;
}
