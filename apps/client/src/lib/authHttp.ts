import { useAuthStore, type AuthUser } from '../store/authStore';

const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

type RefreshResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
};

function applySession(data: RefreshResponse) {
  const user: AuthUser = {
    id: data.user.id,
    username: data.user.username,
    email: data.user.email,
  };
  const store = useAuthStore.getState();
  store.setUser(user);
  store.setToken(data.token);
}

function clearSession() {
  const store = useAuthStore.getState();
  store.setUser(null);
  store.setToken(null);
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${getApiBase()}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = (await res.json().catch(() => ({}))) as Partial<RefreshResponse>;
  if (!res.ok || !data.token || !data.user) {
    clearSession();
    return null;
  }
  applySession(data as RefreshResponse);
  return data.token;
}

export async function fetchWithAutoRefresh(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getApiBase();
  const first = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (first.status !== 401) return first;

  const nextToken = await refreshAccessToken();
  if (!nextToken) return first;

  return fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${nextToken}`,
    },
  });
}
