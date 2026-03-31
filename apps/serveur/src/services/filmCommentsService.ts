import { eq, desc, inArray, sql, and } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { filmComments, users, filmCommentReactions } from '../db/schema/index.js';

export async function listCommentsByImdbId(db: Db, imdbId: string, currentUserId?: string) {
  const rows = await db
    .select({
      id: filmComments.id,
      imdbId: filmComments.imdbId,
      userId: filmComments.userId,
      comment: filmComments.comment,
      createdAt: filmComments.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(filmComments)
    .innerJoin(users, eq(filmComments.userId, users.id))
    .where(eq(filmComments.imdbId, imdbId))
    .orderBy(desc(filmComments.createdAt));

  const commentIds = rows.map((r) => r.id);
  const likeCounts = new Map<string, number>();
  const dislikeCounts = new Map<string, number>();
  const userReactions = new Map<string, number>();

  if (commentIds.length > 0) {
    const counts = await db
      .select({
        filmCommentId: filmCommentReactions.filmCommentId,
        value: filmCommentReactions.value,
        count: sql<number>`count(*)::int`,
      })
      .from(filmCommentReactions)
      .where(inArray(filmCommentReactions.filmCommentId, commentIds))
      .groupBy(filmCommentReactions.filmCommentId, filmCommentReactions.value);

    for (const c of counts) {
      if (c.value === 1) likeCounts.set(c.filmCommentId, c.count);
      else if (c.value === -1) dislikeCounts.set(c.filmCommentId, c.count);
    }

    if (currentUserId) {
      const userRows = await db
        .select({
          filmCommentId: filmCommentReactions.filmCommentId,
          value: filmCommentReactions.value,
        })
        .from(filmCommentReactions)
        .where(
          and(
            inArray(filmCommentReactions.filmCommentId, commentIds),
            eq(filmCommentReactions.userId, currentUserId),
          ),
        );
      for (const r of userRows) userReactions.set(r.filmCommentId, r.value);
    }
  }

  return {
    status: 200,
    body: {
      comments: rows.map((r) => ({
        id: r.id,
        imdbId: r.imdbId,
        userId: r.userId,
        comment: r.comment,
        createdAt: r.createdAt,
        author: { id: r.userId, username: r.username, avatarUrl: r.avatarUrl },
        likeCount: likeCounts.get(r.id) ?? 0,
        dislikeCount: dislikeCounts.get(r.id) ?? 0,
        userReaction: userReactions.get(r.id) ?? null,
      })),
    },
  } as const;
}

export async function createFilmComment(
  db: Db,
  imdbId: string,
  userId: string,
  content: string,
) {
  const trimmed = content.trim();
  if (!trimmed) {
    return { status: 400, body: { error: 'Le commentaire ne peut pas être vide' } } as const;
  }

  const [inserted] = await db
    .insert(filmComments)
    .values({ imdbId, userId, comment: trimmed })
    .returning();

  if (!inserted) {
    return {
      status: 500,
      body: { error: "Erreur lors de l'enregistrement du commentaire" },
    } as const;
  }

  const [user] = await db
    .select({ username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    status: 201,
    body: {
      comment: {
        ...inserted,
        author: user ? { id: userId, username: user.username, avatarUrl: user.avatarUrl } : null,
      },
    },
  } as const;
}
