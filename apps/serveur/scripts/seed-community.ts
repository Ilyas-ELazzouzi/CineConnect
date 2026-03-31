import { eq } from 'drizzle-orm';
import { loadDotEnv, getEnv } from '../src/config/env.js';
import { createDb } from '../src/db/client.js';
import { users, communityPosts, postComments, postLikes } from '../src/db/schema/index.js';
import { hashPassword } from '../src/auth/password.js';

async function main() {
  loadDotEnv();
  const env = getEnv();
  const { db, pool } = createDb(env.DATABASE_URL);

  try {
    const existingPosts = await db.select({ id: communityPosts.id }).from(communityPosts).limit(1);
    if (existingPosts.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Des posts communauté existent déjà, seed ignoré.');
      return;
    }

    const demoUsers = [
      { username: 'Nabil LMRABET', email: 'nabil@example.com' },
      { username: 'Sara Demo', email: 'sara@example.com' },
    ];

    const userIds: string[] = [];
    for (const demo of demoUsers) {
      const found = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, demo.email))
        .limit(1);
      if (found[0]) {
        userIds.push(found[0].id);
        continue;
      }
      const passwordHash = await hashPassword('password123');
      const [inserted] = await db
        .insert(users)
        .values({
          username: demo.username,
          email: demo.email,
          passwordHash,
        })
        .returning({ id: users.id });
      if (inserted) {
        userIds.push(inserted.id);
      }
    }

    const [nabilId, saraId] = userIds;
    if (!nabilId) {
      throw new Error('Impossible de créer ou récupérer un utilisateur de démo.');
    }

    const insertedPosts = await db
      .insert(communityPosts)
      .values([
        {
          userId: nabilId,
          content: 'Breaking Bad : Un avis',
          filmTitle: 'Breaking Bad',
          viewCount: 156,
        },
        {
          userId: nabilId,
          content: 'Dune: Part Two – Une claque visuelle',
          filmTitle: 'Dune: Part Two',
          viewCount: 89,
        },
      ])
      .returning({
        id: communityPosts.id,
      });

    const firstPost = insertedPosts[0];
    if (!firstPost) {
      throw new Error('Seed: aucun post inséré.');
    }

    const commentsToInsert = [];
    commentsToInsert.push({
      postId: firstPost.id,
      userId: nabilId,
      content: 'Une série incroyable, surtout la saison 4 !',
    });
    if (saraId) {
      commentsToInsert.push({
        postId: firstPost.id,
        userId: saraId,
        content: 'Je viens juste de commencer, hâte de voir la suite.',
      });
    }

    await db.insert(postComments).values(commentsToInsert);

    const likesToInsert = [{ postId: firstPost.id, userId: nabilId }];
    if (saraId) {
      likesToInsert.push({ postId: firstPost.id, userId: saraId });
    }
    await db.insert(postLikes).values(likesToInsert);

    // eslint-disable-next-line no-console
    console.log('Seed communauté terminé avec succès.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

