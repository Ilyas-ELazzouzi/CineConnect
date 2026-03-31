import { eq, and, or, desc, sql, ne } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import {
  users,
  communityPosts,
  filmComments,
  filmRatings,
  friends,
} from '../db/schema/index.js';

export async function getMeProfile(db: Db, userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      coverUrl: users.coverUrl,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { status: 404, body: { error: 'Utilisateur introuvable' } } as const;
  }

  const [postsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(communityPosts)
    .where(eq(communityPosts.userId, userId));

  const [commentsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(filmComments)
    .where(eq(filmComments.userId, userId));

  const [ratingsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(filmRatings)
    .where(eq(filmRatings.userId, userId));

  const [friendsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(friends)
    .where(
      and(
        eq(friends.status, 'accepted'),
        or(eq(friends.userId, userId), eq(friends.friendId, userId)),
      ),
    );

  return {
    status: 200,
    body: {
      profile: {
        ...user,
        stats: {
          postsCount: postsCount?.c ?? 0,
          filmCommentsCount: commentsCount?.c ?? 0,
          ratingsCount: ratingsCount?.c ?? 0,
          friendsCount: friendsCount?.c ?? 0,
        },
      },
    },
  } as const;
}

export type UpdateProfileInput = {
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export async function updateMeProfile(db: Db, userId: string, input: UpdateProfileInput) {
  const updates: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.username !== undefined) {
    const trimmed = input.username.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
      return { status: 400, body: { error: 'Le pseudo doit faire entre 3 et 30 caractères' } } as const;
    }
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, trimmed), ne(users.id, userId)))
      .limit(1);
    if (taken) {
      return { status: 409, body: { error: 'Ce pseudo est déjà utilisé' } } as const;
    }
    updates.username = trimmed;
  }

  if (input.bio !== undefined) {
    const b = input.bio?.trim() ?? '';
    if (b.length > 500) {
      return { status: 400, body: { error: 'La bio ne peut pas dépasser 500 caractères' } } as const;
    }
    updates.bio = b || null;
  }

  if (input.avatarUrl !== undefined) {
    updates.avatarUrl = input.avatarUrl?.trim() || null;
  }

  if (input.coverUrl !== undefined) {
    updates.coverUrl = input.coverUrl?.trim() || null;
  }

  await db.update(users).set(updates).where(eq(users.id, userId));

  const result = await getMeProfile(db, userId);
  if (result.status !== 200) return result;
  return { status: 200, body: result.body } as const;
}

export async function listMyPosts(db: Db, userId: string, limit = 50) {
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

export async function listMyFilmComments(db: Db, userId: string, limit = 50) {
  const rows = await db
    .select({
      id: filmComments.id,
      imdbId: filmComments.imdbId,
      comment: filmComments.comment,
      createdAt: filmComments.createdAt,
    })
    .from(filmComments)
    .where(eq(filmComments.userId, userId))
    .orderBy(desc(filmComments.createdAt))
    .limit(Math.min(limit, 100));

  return { status: 200, body: { comments: rows } } as const;
}
