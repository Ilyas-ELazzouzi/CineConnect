import type { RequestHandler } from 'express';
import { z } from 'zod';
import { verifyRefreshToken } from '../auth/jwt.js';
import type { Db } from '../db/client.js';
import type { AuthedRequest } from '../middlewares/auth.js';
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

type CookieResponse = {
  cookie: (name: string, val: string, options: Record<string, unknown>) => void;
  clearCookie: (name: string, options: Record<string, unknown>) => void;
};

export type AuthControllerDeps = {
  db: Db;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  secureCookies: boolean;
};

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

function setRefreshCookie(res: CookieResponse, refreshToken: string, expiresIn: string, secure: boolean) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/api/auth',
    maxAge: toCookieMaxAgeMs(expiresIn),
  });
}

function clearRefreshCookie(res: CookieResponse, secure: boolean) {
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

export function createAuthController(deps: AuthControllerDeps): {
  register: RequestHandler;
  login: RequestHandler;
  refresh: RequestHandler;
  logout: RequestHandler;
  me: RequestHandler;
} {
  const register: RequestHandler = async (req, res, next) => {
    try {
      const body = RegisterSchema.parse(req.body);
      const result = await registerUserService(
        deps.db,
        {
          jwtSecret: deps.jwtSecret,
          jwtExpiresIn: deps.jwtExpiresIn,
          refreshTokenSecret: deps.refreshTokenSecret,
          refreshTokenExpiresIn: deps.refreshTokenExpiresIn,
        },
        body,
      );
      const refreshToken = getRefreshTokenFromBody(result.body);
      if (refreshToken) {
        setRefreshCookie(res, refreshToken, deps.refreshTokenExpiresIn, deps.secureCookies);
      }
      res.status(result.status).json(responseWithoutRefreshToken(result.body));
    } catch (e) {
      next(e);
    }
  };

  const login: RequestHandler = async (req, res, next) => {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await loginUserService(
        deps.db,
        {
          jwtSecret: deps.jwtSecret,
          jwtExpiresIn: deps.jwtExpiresIn,
          refreshTokenSecret: deps.refreshTokenSecret,
          refreshTokenExpiresIn: deps.refreshTokenExpiresIn,
        },
        body,
      );
      const refreshToken = getRefreshTokenFromBody(result.body);
      if (refreshToken) {
        setRefreshCookie(res, refreshToken, deps.refreshTokenExpiresIn, deps.secureCookies);
      }
      res.status(result.status).json(responseWithoutRefreshToken(result.body));
    } catch (e) {
      next(e);
    }
  };

  const refresh: RequestHandler = async (req, res) => {
    try {
      const cookies = parseCookies(req.header('cookie'));
      const refreshToken = cookies[REFRESH_COOKIE];
      if (!refreshToken) {
        res.status(401).json({ error: 'Session expirée' });
        return;
      }
      const payload = verifyRefreshToken(refreshToken, deps.refreshTokenSecret);
      const result = await refreshUserSessionService(
        deps.db,
        { jwtSecret: deps.jwtSecret, jwtExpiresIn: deps.jwtExpiresIn },
        payload.sub,
      );
      if (!('error' in result.body)) {
        setRefreshCookie(res, refreshToken, deps.refreshTokenExpiresIn, deps.secureCookies);
      }
      res.status(result.status).json(result.body);
    } catch {
      clearRefreshCookie(res, deps.secureCookies);
      res.status(401).json({ error: 'Session expirée' });
    }
  };

  const logout: RequestHandler = (_req, res) => {
    clearRefreshCookie(res, deps.secureCookies);
    res.status(204).send();
  };

  const me: RequestHandler = (req, res) => {
    const user = (req as AuthedRequest).user;
    res.json({ user });
  };

  return {
    register,
    login,
    refresh,
    logout,
    me,
  };
}
