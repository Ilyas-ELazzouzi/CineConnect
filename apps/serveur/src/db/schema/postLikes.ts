import { pgTable, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { communityPosts } from './communityPosts.js';

export const postLikes = pgTable(
  'post_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull()
      .references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('post_likes_post_user_unique').on(table.postId, table.userId)],
);
