import { eq, and, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { communityPosts, postReactions } from '../db/schema/index.js';

export async function setPostReaction(db: Db, postId: string, userId: string, value: 1 | -1) {
  const [post] = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    return { status: 404, body: { error: 'Post non trouvé' } } as const;
  }

  const [existing] = await db
    .select()
    .from(postReactions)
    .where(
      and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, userId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.value === value) {
      await db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, postId),
            eq(postReactions.userId, userId),
          ),
        );
    } else {
      await db
        .update(postReactions)
        .set({ value })
        .where(eq(postReactions.id, existing.id));
    }
  } else {
    await db.insert(postReactions).values({ postId, userId, value });
  }

  const [likeCount] = await db
    .select({ count: sql<string | number>`count(*)` })
    .from(postReactions)
    .where(and(eq(postReactions.postId, postId), eq(postReactions.value, 1))));
  const [dislikeCount] = await db
    .select({ count: sql<string | number>`count(*)` })
    .from(postReactions)
    .where(and(eq(postReactions.postId, postId), eq(postReactions.value, -1))));
  const [userReaction] = await db
    .select({ value: postReactions.value })
    .from(postReactions)
    .where(
      and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, userId),
      ),
    )
    .limit(1);

  return {
    status: 200,
    body: {
      likeCount: likeCount?.count != null ? Number(likeCount.count) : 0,
      dislikeCount: dislikeCount?.count != null ? Number(dislikeCount.count) : 0,
      userReaction: userReaction?.value ?? null,
    },
  } as const;
}
