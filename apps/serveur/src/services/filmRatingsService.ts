import { eq, and, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { filmRatings } from '../db/schema/index.js';

const MIN_RATING = 1;
const MAX_RATING = 5;

export async function getFilmRatingInfo(db: Db, imdbId: string, userId?: string) {
  const [agg] = await db
    .select({
      average: sql<number>`coalesce(round(avg(${filmRatings.rating})::numeric, 1), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(filmRatings)
    .where(eq(filmRatings.imdbId, imdbId));

  let userRating: number | null = null;
  if (userId) {
    const [row] = await db
      .select({ rating: filmRatings.rating })
      .from(filmRatings)
      .where(and(eq(filmRatings.imdbId, imdbId), eq(filmRatings.userId, userId)))
      .limit(1);
    if (row) userRating = row.rating;
  }

  return {
    status: 200,
    body: {
      averageRating: Number(agg?.average ?? 0),
      count: agg?.count ?? 0,
      userRating,
    },
  } as const;
}

export async function setFilmRating(db: Db, imdbId: string, userId: string, rating: number) {
  const value = Math.round(rating);
  if (value < MIN_RATING || value > MAX_RATING) {
    return {
      status: 400,
      body: { error: `La note doit être entre ${MIN_RATING} et ${MAX_RATING}` },
    } as const;
  }

  await db
    .insert(filmRatings)
    .values({ imdbId, userId, rating: value })
    .onConflictDoUpdate({
      target: [filmRatings.imdbId, filmRatings.userId],
      set: { rating: value },
    });

  const [agg] = await db
    .select({
      average: sql<number>`coalesce(round(avg(${filmRatings.rating})::numeric, 1), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(filmRatings)
    .where(eq(filmRatings.imdbId, imdbId));

  return {
    status: 200,
    body: {
      averageRating: Number(agg?.average ?? 0),
      count: agg?.count ?? 0,
      userRating: value,
    },
  } as const;
}
