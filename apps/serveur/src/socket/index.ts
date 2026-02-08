import { Server } from 'socket.io';
import type { Env } from '../config/env.js';
import type { Db } from '../db/client.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { messages } from '../db/schema/messages.js';

export function attachSocketServer(httpServer: import('node:http').Server, opts: { env: Env; db: Db }) {
  const io = new Server(httpServer, {
    cors: {
      origin: opts.env.CORS_ORIGINS,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token, opts.env.JWT_SECRET);
      socket.data.user = { id: payload.sub, username: payload.username, email: payload.email };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('room:join', (roomId: string) => {
      if (typeof roomId !== 'string' || roomId.length < 1) return;
      socket.join(roomId);
    });

    socket.on('message:send', async (payload: { roomId: string; content: string }) => {
      if (!payload || typeof payload.roomId !== 'string' || typeof payload.content !== 'string') return;
      const roomId = payload.roomId.trim();
      const content = payload.content.trim();
      if (!roomId || !content) return;

      const user = socket.data.user as { id: string; username: string; email: string };
      try {
        const inserted = await opts.db
          .insert(messages)
          .values({ roomId, userId: user.id, content })
          .returning({ id: messages.id, roomId: messages.roomId, userId: messages.userId, content: messages.content, createdAt: messages.createdAt });

        const msg = inserted[0];
        io.to(roomId).emit('message:new', { message: msg, user: { id: user.id, username: user.username } });
      } catch {
        socket.emit('message:error', { error: 'Impossible de sauvegarder le message' });
      }
    });
  });

  return io;
}
