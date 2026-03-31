import { pgTable, smallint, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { communityPosts } from './communityPosts.js';

export const postReactions = pgTable(
  'post_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    value: smallint('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('post_reactions_post_user_unique').on(table.postId, table.userId)],
);
