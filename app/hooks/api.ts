import { useAuth } from '@/hooks/authProvider';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

export const useApi = () => {
  const { getToken } = useAuth();
  const authed = async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error('No auth token');
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  };
  return {
    get: (p: string) => authed(p),
    post: (p: string, body?: any) => authed(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch:(p: string, body?: any) => authed(p, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  };
};
