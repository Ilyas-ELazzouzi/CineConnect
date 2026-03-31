import { eq, and, desc, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { users, friends, communityPosts } from '../db/schema/index.js';

/** Abonnement : `user_id` suit `friend_id`, statut `accepted`. */
export async function getPublicProfile(db: Db, targetUserId: string, viewerId?: string) {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      coverUrl: users.coverUrl,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!row) {
    return { status: 404, body: { error: 'Utilisateur introuvable' } } as const;
  }

  const [followersAgg] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(friends)
    .where(and(eq(friends.friendId, targetUserId), eq(friends.status, 'accepted')));

  const [followingAgg] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(friends)
    .where(and(eq(friends.userId, targetUserId), eq(friends.status, 'accepted')));

  const [postsAgg] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(communityPosts)
    .where(eq(communityPosts.userId, targetUserId));

  let viewerFollows = false;
  if (viewerId && viewerId !== targetUserId) {
    const [edge] = await db
      .select({ id: friends.id })
      .from(friends)
      .where(
        and(
          eq(friends.userId, viewerId),
          eq(friends.friendId, targetUserId),
          eq(friends.status, 'accepted'),
        ),
      )
      .limit(1);
    viewerFollows = !!edge;
  }

  const isSelf = viewerId === targetUserId;

  return {
    status: 200,
    body: {
      profile: {
        ...row,
        stats: {
          followersCount: followersAgg?.c ?? 0,
          followingCount: followingAgg?.c ?? 0,
          postsCount: postsAgg?.c ?? 0,
        },
        viewerFollows,
        isSelf,
      },
    },
  } as const;
}

export async function listUserCommunityPosts(db: Db, userId: string, limit = 50) {
  const rows = await db
    .select({
      id: communityPosts.id,
      content: communityPosts.content,
      filmTitle: communityPosts.filmTitle,
      imageUrl: communityPosts.imageUrl,
      viewCount: communityPosts.viewCount,
      createdAt: communityPosts.createdAt,
    })
    .from(communityPosts)
    .where(eq(communityPosts.userId, userId))
    .orderBy(desc(communityPosts.createdAt))
    .limit(Math.min(limit, 100));

  return { status: 200, body: { posts: rows } } as const;
}

export type PublicUserSummary = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export async function listFollowers(db: Db, targetUserId: string, limit = 50) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(friends)
    .innerJoin(users, eq(friends.userId, users.id))
    .where(and(eq(friends.friendId, targetUserId), eq(friends.status, 'accepted')))
    .orderBy(desc(friends.createdAt))
    .limit(Math.min(limit, 100));

  return { status: 200, body: { users: rows as PublicUserSummary[] } } as const;
}

export async function listFollowing(db: Db, targetUserId: string, limit = 50) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(friends)
    .innerJoin(users, eq(friends.friendId, users.id))
    .where(and(eq(friends.userId, targetUserId), eq(friends.status, 'accepted')))
    .orderBy(desc(friends.createdAt))
    .limit(Math.min(limit, 100));

  return { status: 200, body: { users: rows as PublicUserSummary[] } } as const;
}

export async function followUser(db: Db, followerId: string, followingId: string) {
  if (followerId === followingId) {
    return { status: 400, body: { error: 'Vous ne pouvez pas vous suivre vous-même' } } as const;
  }

  const [target] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, followingId))
    .limit(1);

  if (!target) {
    return { status: 404, body: { error: 'Utilisateur introuvable' } } as const;
  }

  const [existing] = await db
    .select({ id: friends.id, status: friends.status })
    .from(friends)
    .where(and(eq(friends.userId, followerId), eq(friends.friendId, followingId)))
    .limit(1);

  if (existing) {
    if (existing.status === 'accepted') {
      return { status: 200, body: { following: true } } as const;
    }
    await db
      .update(friends)
      .set({ status: 'accepted' })
      .where(eq(friends.id, existing.id));
    return { status: 200, body: { following: true } } as const;
  }

  await db.insert(friends).values({
    userId: followerId,
    friendId: followingId,
    status: 'accepted',
  });

  return { status: 201, body: { following: true } } as const;
}

export async function unfollowUser(db: Db, followerId: string, followingId: string) {
  const deleted = await db
    .delete(friends)
    .where(and(eq(friends.userId, followerId), eq(friends.friendId, followingId)))
    .returning({ id: friends.id });

  if (deleted.length === 0) {
    return { status: 404, body: { error: 'Abonnement introuvable' } } as const;
  }

  return { status: 200, body: { following: false } } as const;
}
