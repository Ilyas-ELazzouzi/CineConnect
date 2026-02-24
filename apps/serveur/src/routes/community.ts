import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import {
  listPostsService,
  createPostService,
  getPostByIdService,
  incrementViewCountService,
  getTrendingTopicsService,
} from '../services/communityPostsService.js';
import { listCommentsService, createCommentService } from '../services/communityCommentsService.js';
import { toggleLikeService } from '../services/communityLikesService.js';

const CreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
  filmTitle: z.string().max(200).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export function registerCommunityRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  router.get('/api/community/posts', async (_req, res, next) => {
    try {
      const limit = Math.min(Number(_req.query.limit) || 50, 100);
      const result = await listPostsService(opts.db, limit);
      res.status(200).json({ posts: result });
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/community/posts/trending', async (_req, res, next) => {
    try {
      const result = await getTrendingTopicsService(opts.db);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post(
    '/api/community/posts',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const body = CreatePostSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const result = await createPostService(opts.db, user.id, {
          content: body.content,
          ...(body.filmTitle !== undefined && { filmTitle: body.filmTitle }),
          ...(body.imageUrl !== undefined && body.imageUrl !== '' && { imageUrl: body.imageUrl }),
        });
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );

  router.get('/api/community/posts/:postId', async (req, res, next) => {
    try {
      const postId = req.params.postId as string;
      const result = await getPostByIdService(opts.db, postId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post(
    '/api/community/posts/:postId/view',
    async (req, res, next) => {
      try {
        const postId = req.params.postId as string;
        const result = await incrementViewCountService(opts.db, postId);
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );

  router.get('/api/community/posts/:postId/comments', async (req, res, next) => {
    try {
      const postId = req.params.postId as string;
      const result = await listCommentsService(opts.db, postId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post(
    '/api/community/posts/:postId/comments',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const body = CreateCommentSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const postId = req.params.postId as string;
        const result = await createCommentService(
          opts.db,
          postId,
          user.id,
          body.content,
        );
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );

  router.post(
    '/api/community/posts/:postId/like',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const user = (req as AuthedRequest).user;
        const postId = req.params.postId as string;
        const result = await toggleLikeService(
          opts.db,
          postId,
          user.id,
        );
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );
}
