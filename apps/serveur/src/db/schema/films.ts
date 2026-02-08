import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const films = pgTable('films', {
  id: uuid('id').primaryKey().defaultRandom(),
  imdbId: text('imdb_id').unique(),
  title: text('title').notNull(),
  year: integer('year'),
  posterUrl: text('poster_url'),
  plot: text('plot'),
  director: text('director'),
  runtime: text('runtime'),
  imdbRating: text('imdb_rating'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

