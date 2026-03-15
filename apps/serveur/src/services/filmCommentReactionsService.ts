import { eq, and, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { filmComments, filmCommentReactions } from '../db/schema/index.js';

export async function setFilmCommentReaction(
  db: Db,
  commentId: string,
  userId: string,
  value: 1 | -1,
) {
  const [comment] = await db
    .select({ id: filmComments.id })
    .from(filmComments)
    .where(eq(filmComments.id, commentId))
    .limit(1);

  if (!comment) {
    return { status: 404, body: { error: 'Commentaire non trouvé' } } as const;
  }

  const [existing] = await db
    .select()
    .from(filmCommentReactions)
    .where(
      and(
        eq(filmCommentReactions.filmCommentId, commentId),
        eq(filmCommentReactions.userId, userId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.value === value) {
      await db
        .delete(filmCommentReactions)
        .where(
          and(
            eq(filmCommentReactions.filmCommentId, commentId),
            eq(filmCommentReactions.userId, userId),
          ),
        );
    } else {
      await db
        .update(filmCommentReactions)
        .set({ value })
        .where(eq(filmCommentReactions.id, existing.id));
    }
  } else {
    await db.insert(filmCommentReactions).values({ filmCommentId: commentId, userId, value });
  }

  const [likeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(filmCommentReactions)
    .where(
      and(
        eq(filmCommentReactions.filmCommentId, commentId),
        eq(filmCommentReactions.value, 1),
      ),
    );
  const [dislikeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(filmCommentReactions)
    .where(
      and(
        eq(filmCommentReactions.filmCommentId, commentId),
        eq(filmCommentReactions.value, -1),
      ),
    );
  const [userReaction] = await db
    .select({ value: filmCommentReactions.value })
    .from(filmCommentReactions)
    .where(
      and(
        eq(filmCommentReactions.filmCommentId, commentId),
        eq(filmCommentReactions.userId, userId),
      ),
    )
    .limit(1);

  return {
    status: 200,
    body: {
      likeCount: likeCount?.count ?? 0,
      dislikeCount: dislikeCount?.count ?? 0,
      userReaction: userReaction?.value ?? null,
    },
  } as const;
}
