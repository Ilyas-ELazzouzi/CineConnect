import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { verifyRefreshToken } from '../auth/jwt.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import {
  loginUserService,
  refreshUserSessionService,
  registerUserService,
} from '../services/authService.js';

const RegisterSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

const REFRESH_COOKIE = 'refresh_token';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const trimmed = p.trim();
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function toCookieMaxAgeMs(expiresIn: string): number {
  const t = expiresIn.trim();
  const m = /^(\d+)([smhd])?$/.exec(t);
  if (!m) return 1000 * 60 * 60 * 24 * 30;
  const n = Number(m[1]);
  const unit = m[2] ?? 's';
  if (!Number.isFinite(n) || n <= 0) return 1000 * 60 * 60 * 24 * 30;
  const mul = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return n * mul;
}

function setRefreshCookie(
  res: { cookie: (name: string, val: string, options: Record<string, unknown>) => void },
  refreshToken: string,
  expiresIn: string,
  secure: boolean,
) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/auth',
    maxAge: toCookieMaxAgeMs(expiresIn),
  });
}

function clearRefreshCookie(
  res: { clearCookie: (name: string, options: Record<string, unknown>) => void },
  secure: boolean,
) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/auth',
  });
}

function responseWithoutRefreshToken<T extends Record<string, unknown>>(body: T) {
  const { refreshToken: _refreshToken, ...rest } = body;
  return rest;
}

function getRefreshTokenFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = (body as Record<string, unknown>).refreshToken;
  return typeof candidate === 'string' ? candidate : null;
}

export function registerAuthRoutes(
  router: Router,
  opts: {
    db: Db;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    secureCookies: boolean;
  },
) {
  router.post('/api/auth/register', async (req, res, next) => {
    try {
      const body = RegisterSchema.parse(req.body);
      const result = await registerUserService(
        opts.db,
        {
          jwtSecret: opts.jwtSecret,
          jwtExpiresIn: opts.jwtExpiresIn,
          refreshTokenSecret: opts.refreshTokenSecret,
          refreshTokenExpiresIn: opts.refreshTokenExpiresIn,
        },
        body,
      );
      const refreshToken = getRefreshTokenFromBody(result.body);
      if (refreshToken) {
        setRefreshCookie(res, refreshToken, opts.refreshTokenExpiresIn, opts.secureCookies);
      }
      res.status(result.status).json(responseWithoutRefreshToken(result.body));
    } catch (e) {
      next(e);
    }
  });

  router.post('/api/auth/login', async (req, res, next) => {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await loginUserService(
        opts.db,
        {
          jwtSecret: opts.jwtSecret,
          jwtExpiresIn: opts.jwtExpiresIn,
          refreshTokenSecret: opts.refreshTokenSecret,
          refreshTokenExpiresIn: opts.refreshTokenExpiresIn,
        },
        body,
      );
      const refreshToken = getRefreshTokenFromBody(result.body);
      if (refreshToken) {
        setRefreshCookie(res, refreshToken, opts.refreshTokenExpiresIn, opts.secureCookies);
      }
      res.status(result.status).json(responseWithoutRefreshToken(result.body));
    } catch (e) {
      next(e);
    }
  });

  router.post('/api/auth/refresh', async (req, res) => {
    try {
      const cookies = parseCookies(req.header('cookie'));
      const refreshToken = cookies[REFRESH_COOKIE];
      if (!refreshToken) {
        res.status(401).json({ error: 'Session expirée' });
        return;
      }
      const payload = verifyRefreshToken(refreshToken, opts.refreshTokenSecret);
      const result = await refreshUserSessionService(
        opts.db,
        { jwtSecret: opts.jwtSecret, jwtExpiresIn: opts.jwtExpiresIn },
        payload.sub,
      );
      if (!('error' in result.body)) {
        const rotatedRefreshToken = refreshToken;
        setRefreshCookie(
          res,
          rotatedRefreshToken,
          opts.refreshTokenExpiresIn,
          opts.secureCookies,
        );
      }
      res.status(result.status).json(result.body);
    } catch {
      clearRefreshCookie(res, opts.secureCookies);
      res.status(401).json({ error: 'Session expirée' });
    }
  });

  router.post('/api/auth/logout', (_req, res) => {
    clearRefreshCookie(res, opts.secureCookies);
    res.status(204).send();
  });

  router.get('/api/auth/me', requireAuth(opts.jwtSecret), async (req, res) => {
    const user = (req as AuthedRequest).user;
    res.json({ user });
  });
}
