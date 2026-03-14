import { eq, desc } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { filmComments, users } from '../db/schema/index.js';

export async function listCommentsByImdbId(db: Db, imdbId: string) {
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
