import { pgTable, smallint, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { filmComments } from './filmComments.js';

export const filmCommentReactions = pgTable(
  'film_comment_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filmCommentId: uuid('film_comment_id')
      .notNull()
      .references(() => filmComments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    value: smallint('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('film_comment_reactions_comment_user_unique').on(table.filmCommentId, table.userId)],
);
