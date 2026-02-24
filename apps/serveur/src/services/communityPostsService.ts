import { eq, desc, sql, inArray } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { communityPosts, postComments, postLikes, users } from '../db/schema/index.js';

export type PostWithMeta = {
  id: string;
  userId: string;
  content: string;
  filmTitle: string | null;
  imageUrl: string | null;
  viewCount: number;
  createdAt: Date;
  author: { id: string; username: string; avatarUrl: string | null };
  commentCount: number;
  likeCount: number;
};

export async function listPostsService(db: Db, limit = 50): Promise<PostWithMeta[]> {
  const rows = await db
    .select({
      id: communityPosts.id,
      userId: communityPosts.userId,
      content: communityPosts.content,
      filmTitle: communityPosts.filmTitle,
      imageUrl: communityPosts.imageUrl,
      viewCount: communityPosts.viewCount,
      createdAt: communityPosts.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit);

  const postIds = rows.map((r) => r.id);

  const commentCounts =
    postIds.length === 0
      ? []
      : await db
          .select({
            postId: postComments.postId,
            count: sql<number>`count(*)::int`,
          })
          .from(postComments)
          .where(inArray(postComments.postId, postIds))
          .groupBy(postComments.postId);

  const likeCounts =
    postIds.length === 0
      ? []
      : await db
          .select({
            postId: postLikes.postId,
            count: sql<number>`count(*)::int`,
          })
          .from(postLikes)
          .where(inArray(postLikes.postId, postIds))
          .groupBy(postLikes.postId);

  const commentByPost = new Map(commentCounts.map((c) => [c.postId, c.count]));
  const likeByPost = new Map(likeCounts.map((l) => [l.postId, l.count]));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    content: r.content,
    filmTitle: r.filmTitle,
    imageUrl: r.imageUrl,
    viewCount: r.viewCount,
    createdAt: r.createdAt,
    author: { id: r.userId, username: r.username, avatarUrl: r.avatarUrl },
    commentCount: commentByPost.get(r.id) ?? 0,
    likeCount: likeByPost.get(r.id) ?? 0,
  }));
}

export async function createPostService(
  db: Db,
  userId: string,
  input: { content: string; filmTitle?: string; imageUrl?: string },
) {
  const [inserted] = await db
    .insert(communityPosts)
    .values({
      userId,
      content: input.content.trim(),
      filmTitle: input.filmTitle?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
    })
    .returning();

  if (!inserted) {
    return { status: 500, body: { error: 'Erreur lors de la création du post' } } as const;
  }

  const [user] = await db
    .select({ username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    status: 201,
    body: {
      post: {
        ...inserted,
        author: user ? { id: userId, username: user.username, avatarUrl: user.avatarUrl } : null,
        commentCount: 0,
        likeCount: 0,
      },
    },
  } as const;
}

export async function getPostByIdService(db: Db, postId: string) {
  const [row] = await db
    .select({
      id: communityPosts.id,
      userId: communityPosts.userId,
      content: communityPosts.content,
      filmTitle: communityPosts.filmTitle,
      imageUrl: communityPosts.imageUrl,
      viewCount: communityPosts.viewCount,
      createdAt: communityPosts.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!row) {
    return { status: 404, body: { error: 'Post non trouvé' } } as const;
  }

  const [commentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postComments)
    .where(eq(postComments.postId, postId));

  const [likeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postLikes)
    .where(eq(postLikes.postId, postId));

  return {
    status: 200,
    body: {
      post: {
        ...row,
        author: { id: row.userId, username: row.username, avatarUrl: row.avatarUrl },
        commentCount: commentCount?.count ?? 0,
        likeCount: likeCount?.count ?? 0,
      },
    },
  } as const;
}

export async function incrementViewCountService(db: Db, postId: string) {
  await db
    .update(communityPosts)
    .set({ viewCount: sql`${communityPosts.viewCount} + 1` })
    .where(eq(communityPosts.id, postId));
  return { status: 200, body: { ok: true } } as const;
}

export async function getTrendingTopicsService(db: Db, limit = 10) {
  const rows = await db
    .select({
      filmTitle: communityPosts.filmTitle,
      count: sql<number>`count(*)::int`,
    })
    .from(communityPosts)
    .where(sql`${communityPosts.filmTitle} is not null and ${communityPosts.filmTitle} != ''`)
    .groupBy(communityPosts.filmTitle)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return {
    status: 200,
    body: {
      topics: rows.map((r) => ({ name: r.filmTitle!, postCount: r.count })),
    },
  } as const;
}

