import type { Router } from 'express';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import { listMessagesInRoom, listConversations } from '../services/messagesService.js';

export function registerMessagesApiRoutes(router: Router, opts: { db: Db; jwtSecret: string }) {
  router.get('/api/messages/conversations', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user;
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = await listConversations(opts.db, user.id, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/messages/rooms/:roomId', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const roomId = decodeURIComponent(req.params.roomId ?? '');
      const user = (req as AuthedRequest).user;
      const limit = Math.min(Number(req.query.limit) || 200, 500);
      const result = await listMessagesInRoom(opts.db, roomId, user.id, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });
}
