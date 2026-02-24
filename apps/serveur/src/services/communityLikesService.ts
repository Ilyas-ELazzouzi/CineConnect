import { eq, sql, and } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { communityPosts, postLikes } from '../db/schema/index.js';

export async function toggleLikeService(db: Db, postId: string, userId: string) {
  const [post] = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    return { status: 404, body: { error: 'Post non trouvé' } } as const;
  }

  const existing = await db
    .select({ id: postLikes.id })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    const [likeCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    return { status: 200, body: { liked: false, likeCount: likeCount?.count ?? 0 } } as const;
  }

  await db.insert(postLikes).values({ postId, userId });
  const [likeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postLikes)
    .where(eq(postLikes.postId, postId));
  return { status: 200, body: { liked: true, likeCount: likeCount?.count ?? 0 } } as const;
}

