import { eq, desc } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { communityPosts, postComments, users } from '../db/schema/index.js';

export async function listCommentsService(db: Db, postId: string) {
  const rows = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      content: postComments.content,
      createdAt: postComments.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(desc(postComments.createdAt));

  return {
    status: 200,
    body: {
      comments: rows.map((r) => ({
        id: r.id,
        postId: r.postId,
        userId: r.userId,
        content: r.content,
        createdAt: r.createdAt,
        author: { id: r.userId, username: r.username, avatarUrl: r.avatarUrl },
      })),
    },
  } as const;
}

export async function createCommentService(
  db: Db,
  postId: string,
  userId: string,
  content: string,
) {
  const [post] = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    return { status: 404, body: { error: 'Post non trouvé' } } as const;
  }

  const [inserted] = await db
    .insert(postComments)
    .values({ postId, userId, content: content.trim() })
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

