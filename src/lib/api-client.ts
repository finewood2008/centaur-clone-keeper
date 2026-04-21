/**
 * 本地 API 客户端 — 替代 Supabase client
 *
 * 所有请求走 /api/trade/*，Vite proxy 转发到 Express(:3456)
 * 认证通过 Bearer Token (JWT)
 * 响应格式: { code: 0, data: T, message: 'success' }
 */

const TOKEN_KEY = 'banrenma_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // In Electron production mode (file:// protocol), use absolute URL
  const baseUrl = window.location.protocol === 'file:'
    ? 'http://localhost:3456/api/trade'
    : '/api/trade';

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.code !== 0) {
    throw new ApiError(json.code || res.status, json.message || `API error ${res.status}`);
  }

  return json.data;
}
