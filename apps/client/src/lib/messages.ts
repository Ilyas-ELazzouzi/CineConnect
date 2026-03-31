const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export function getSocketUrl(): string {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export interface ApiMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  authorUsername: string;
}

export interface ConversationSummary {
  roomId: string;
  peerId: string;
  peerUsername: string;
  lastContent: string | null;
  lastAt: string | null;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchRoomMessages(
  roomId: string,
  token: string,
  limit = 200,
): Promise<ApiMessage[]> {
  const base = getApiBase();
  const enc = encodeURIComponent(roomId);
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${base}/api/messages/rooms/${enc}?${params}`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { messages?: ApiMessage[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les messages');
  return data.messages ?? [];
}

export async function fetchConversations(
  token: string,
  limit = 50,
): Promise<ConversationSummary[]> {
  const base = getApiBase();
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${base}/api/messages/conversations?${params}`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { conversations?: ConversationSummary[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les conversations');
  return data.conversations ?? [];
}
