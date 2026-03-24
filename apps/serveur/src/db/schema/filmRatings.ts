import { pgTable, text, timestamp, uuid, smallint, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const filmRatings = pgTable(
  'film_ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    imdbId: text('imdb_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: smallint('rating').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('film_ratings_imdb_user_unique').on(table.imdbId, table.userId)],
);
