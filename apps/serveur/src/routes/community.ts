import type { Router } from 'express';
import type { Db } from '../db/client.js';
import { requireAuth } from '../middlewares/auth.js';
import { createCommunityController } from '../controllers/communityController.js';

export function registerCommunityRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  const controller = createCommunityController(opts);
  router.get('/api/community/posts', controller.listPosts);
  router.get('/api/community/posts/trending', controller.listTrendingTopics);
  router.post('/api/community/posts', requireAuth(opts.jwtSecret), controller.createPost);
  router.get('/api/community/posts/:postId', controller.getPostById);
  router.post('/api/community/posts/:postId/view', controller.incrementViewCount);
  router.get('/api/community/posts/:postId/comments', controller.listComments);
  router.post(
    '/api/community/posts/:postId/comments',
    requireAuth(opts.jwtSecret),
    controller.createComment,
  );
  router.post('/api/community/posts/:postId/like', requireAuth(opts.jwtSecret), controller.toggleLike);
  router.post(
    '/api/community/posts/:postId/reaction',
    requireAuth(opts.jwtSecret),
    controller.setReaction,
  );
}
