import { eq, desc, sql, or } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { messages, users } from '../db/schema/index.js';
import { parseDmRoomId, canAccessDmRoom } from './dmRoom.js';

export type MessageRow = {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
  authorUsername: string;
};

export async function listMessagesInRoom(db: Db, roomId: string, userId: string, limit = 200) {
  if (!canAccessDmRoom(userId, roomId)) {
    return { status: 403, body: { error: 'Accès refusé à ce salon' } } as const;
  }

  const rows = await db
    .select({
      id: messages.id,
      roomId: messages.roomId,
      userId: messages.userId,
      content: messages.content,
      createdAt: messages.createdAt,
      authorUsername: users.username,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.roomId, roomId))
    .orderBy(messages.createdAt)
    .limit(Math.min(limit, 500));

  const list: MessageRow[] = rows.map((r) => ({
    id: r.id,
    roomId: r.roomId,
    userId: r.userId,
    content: r.content,
    createdAt: r.createdAt,
    authorUsername: r.authorUsername,
  }));

  return { status: 200, body: { messages: list } } as const;
}

export type ConversationSummary = {
  roomId: string;
  peerId: string;
  peerUsername: string;
  lastContent: string | null;
  lastAt: string | null;
};

export async function listConversations(db: Db, userId: string, limit = 50) {
  const distinctRooms = await db
    .selectDistinct({ roomId: messages.roomId })
    .from(messages)
    .where(
      or(
        eq(messages.userId, userId),
        sql`strpos(${messages.roomId}::text, ${userId}) > 0`,
      ),
    );

  const roomIds = [...new Set(distinctRooms.map((r) => r.roomId))]
    .filter((id) => parseDmRoomId(id) !== null && canAccessDmRoom(userId, id))
    .slice(0, limit);

  if (roomIds.length === 0) {
    return { status: 200, body: { conversations: [] as ConversationSummary[] } } as const;
  }

  const lastPerRoom = await Promise.all(
    roomIds.map(async (roomId) => {
      const [last] = await db
        .select({ content: messages.content, createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.roomId, roomId))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      return last ? { roomId, content: last.content, createdAt: last.createdAt } : null;
    }),
  );

  const summaries: ConversationSummary[] = [];
  for (const item of lastPerRoom) {
    if (!item) continue;
    const pair = parseDmRoomId(item.roomId);
    if (!pair) continue;
    const peerId = pair.a === userId ? pair.b : pair.a;
    const [peer] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, peerId))
      .limit(1);
    summaries.push({
      roomId: item.roomId,
      peerId,
      peerUsername: peer?.username ?? 'Utilisateur',
      lastContent: item.content,
      lastAt: item.createdAt.toISOString(),
    });
  }

  summaries.sort((a, b) => {
    const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return tb - ta;
  });

  return { status: 200, body: { conversations: summaries } } as const;
}
