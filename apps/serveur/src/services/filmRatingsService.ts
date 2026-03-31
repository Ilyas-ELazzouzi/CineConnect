import { eq, and, sql } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { filmRatings } from '../db/schema/index.js';

const MIN_RATING = 1;
const MAX_RATING = 5;

export async function getFilmRatingInfo(db: Db, imdbId: string, userId?: string) {
  const aggRows = await db
    .select({
      average: sql<string | number>`avg(${filmRatings.rating})`,
      count: sql<string | number>`count(*)`,
    })
    .from(filmRatings)
    .where(eq(filmRatings.imdbId, imdbId));

  const agg = aggRows[0];
  const rawAverage = agg?.average;
  const rawCount = agg?.count;
  const averageRating =
    rawAverage != null && rawAverage !== ''
      ? Math.round(Number(rawAverage) * 10) / 10
      : 0;
  const count = rawCount != null ? Number(rawCount) : 0;

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
      averageRating,
      count,
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

  const [existing] = await db
    .select({ id: filmRatings.id })
    .from(filmRatings)
    .where(and(eq(filmRatings.imdbId, imdbId), eq(filmRatings.userId, userId)))
    .limit(1);

  if (existing) {
    await db.update(filmRatings).set({ rating: value }).where(eq(filmRatings.id, existing.id));
  } else {
    await db.insert(filmRatings).values({ imdbId, userId, rating: value });
  }

  const aggRows = await db
    .select({
      average: sql<string | number>`avg(${filmRatings.rating})`,
      count: sql<string | number>`count(*)`,
    })
    .from(filmRatings)
    .where(eq(filmRatings.imdbId, imdbId));

  const agg = aggRows[0];
  const rawAverage = agg?.average;
  const rawCount = agg?.count;
  const averageRating =
    rawAverage != null && rawAverage !== ''
      ? Math.round(Number(rawAverage) * 10) / 10
      : 0;
  const count = rawCount != null ? Number(rawCount) : 0;

  return {
    status: 200,
    body: {
      averageRating,
      count,
      userRating: value,
    },
  } as const;
}
