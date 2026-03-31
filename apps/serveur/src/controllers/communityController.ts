import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { verifyAccessToken } from '../auth/jwt.js';
import type { AuthedRequest } from '../middlewares/auth.js';
import {
  listPostsService,
  createPostService,
  getPostByIdService,
  incrementViewCountService,
  getTrendingTopicsService,
  type CommunityFeedSort,
} from '../services/communityPostsService.js';
import { listCommentsService, createCommentService } from '../services/communityCommentsService.js';
import { toggleLikeService } from '../services/communityLikesService.js';
import { setPostReaction } from '../services/postReactionsService.js';

const CreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
  filmTitle: z.string().max(200).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

const ReactionSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type CommunityControllerDeps = {
  db: Db;
  jwtSecret: string;
};

export function createCommunityController(deps: CommunityControllerDeps): {
  listPosts: RequestHandler;
  listTrendingTopics: RequestHandler;
  createPost: RequestHandler;
  getPostById: RequestHandler;
  incrementViewCount: RequestHandler;
  listComments: RequestHandler;
  createComment: RequestHandler;
  toggleLike: RequestHandler;
  setReaction: RequestHandler;
} {
  const listPosts: RequestHandler = async (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const sortRaw = typeof req.query.sort === 'string' ? req.query.sort : undefined;
      const sort: CommunityFeedSort = sortRaw === 'trending' || sortRaw === 'hot' ? sortRaw : 'all';

      let currentUserId: string | undefined;
      const auth = req.header('authorization');
      if (auth?.toLowerCase().startsWith('bearer ')) {
        try {
          const payload = verifyAccessToken(auth.slice(7).trim(), deps.jwtSecret);
          currentUserId = payload.sub;
        } catch {
          // token invalid, list without user reaction
        }
      }

      const result = await listPostsService(deps.db, limit, currentUserId, sort);
      res.status(200).json({ posts: result });
    } catch (e) {
      next(e);
    }
  };

  const listTrendingTopics: RequestHandler = async (_req, res, next) => {
    try {
      const result = await getTrendingTopicsService(deps.db);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const createPost: RequestHandler = async (req, res, next) => {
    try {
      const body = CreatePostSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const result = await createPostService(deps.db, user.id, {
        content: body.content,
        ...(body.filmTitle !== undefined && { filmTitle: body.filmTitle }),
        ...(body.imageUrl !== undefined && body.imageUrl !== '' && { imageUrl: body.imageUrl }),
      });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const getPostById: RequestHandler = async (req, res, next) => {
    try {
      const postId = req.params.postId as string;
      const result = await getPostByIdService(deps.db, postId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const incrementViewCount: RequestHandler = async (req, res, next) => {
    try {
      const postId = req.params.postId as string;
      const result = await incrementViewCountService(deps.db, postId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const listComments: RequestHandler = async (req, res, next) => {
    try {
      const postId = req.params.postId as string;
      const result = await listCommentsService(deps.db, postId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const createComment: RequestHandler = async (req, res, next) => {
    try {
      const body = CreateCommentSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const postId = req.params.postId as string;
      const result = await createCommentService(deps.db, postId, user.id, body.content);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const toggleLike: RequestHandler = async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user;
      const postId = req.params.postId as string;
      const result = await toggleLikeService(deps.db, postId, user.id);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const setReaction: RequestHandler = async (req, res, next) => {
    try {
      const body = ReactionSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const postId = req.params.postId as string;
      const result = await setPostReaction(deps.db, postId, user.id, body.value);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  return {
    listPosts,
    listTrendingTopics,
    createPost,
    getPostById,
    incrementViewCount,
    listComments,
    createComment,
    toggleLike,
    setReaction,
  };
}
