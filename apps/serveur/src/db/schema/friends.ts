import { pgTable, timestamp, uuid, text, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const friendStatusEnum = ['pending', 'accepted', 'rejected'] as const;

export const friends = pgTable(
  'friends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    friendId: uuid('friend_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: friendStatusEnum }).notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('friends_user_friend_unique').on(table.userId, table.friendId)],
);
