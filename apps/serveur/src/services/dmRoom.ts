import { z } from 'zod';

const uuid = z.string().uuid();

/** Format : dm_<uuid1>_<uuid2> (triés lexicographiquement). */
const DM_ROOM = /^dm_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function parseDmRoomId(roomId: string): { a: string; b: string } | null {
  const m = roomId.trim().match(DM_ROOM);
  if (!m) return null;
  const a = m[1];
  const b = m[2];
  const pa = uuid.safeParse(a);
  const pb = uuid.safeParse(b);
  if (!pa.success || !pb.success) return null;
  return { a: pa.data, b: pb.data };
}

export function canAccessDmRoom(userId: string, roomId: string): boolean {
  const p = parseDmRoomId(roomId);
  if (!p) return false;
  return p.a === userId || p.b === userId;
}
