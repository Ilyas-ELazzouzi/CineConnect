import { eq, or } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { users } from '../db/schema/index.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signAccessToken, signRefreshToken } from '../auth/jwt.js';

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUserService(
  db: Db,
  opts: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  },
  input: RegisterInput,
) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, input.email), eq(users.username, input.username)))
    .limit(1);

  if (existing.length > 0) {
    return {
      status: 409,
      body: { error: 'Utilisateur déjà existant' as const },
    };
  }

  const passwordHash = await hashPassword(input.password);

  const inserted = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      passwordHash,
    })
    .returning({ id: users.id, username: users.username, email: users.email });

  const user = inserted[0];
  if (!user) {
    return {
      status: 500,
      body: { error: "Impossible de créer l'utilisateur" as const },
    };
  }

  const token = signAccessToken(
    { sub: user.id, username: user.username, email: user.email },
    opts.jwtSecret,
    opts.jwtExpiresIn,
  );
  const refreshToken = signRefreshToken(
    { sub: user.id },
    opts.refreshTokenSecret,
    opts.refreshTokenExpiresIn,
  );

  return {
    status: 201,
    body: { token, refreshToken, user },
  };
}

export async function loginUserService(
  db: Db,
  opts: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  },
  input: LoginInput,
) {
  const found = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  const user = found[0];
  if (!user) {
    return {
      status: 401,
      body: { error: 'Identifiants invalides' as const },
    };
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    return {
      status: 401,
      body: { error: 'Identifiants invalides' as const },
    };
  }

  const token = signAccessToken(
    { sub: user.id, username: user.username, email: user.email },
    opts.jwtSecret,
    opts.jwtExpiresIn,
  );
  const refreshToken = signRefreshToken(
    { sub: user.id },
    opts.refreshTokenSecret,
    opts.refreshTokenExpiresIn,
  );

  return {
    status: 200,
    body: {
      token,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    },
  };
}

export async function refreshUserSessionService(
  db: Db,
  opts: { jwtSecret: string; jwtExpiresIn: string },
  userId: string,
) {
  const found = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = found[0];
  if (!user) {
    return {
      status: 401,
      body: { error: 'Session invalide' as const },
    };
  }

  const token = signAccessToken(
    { sub: user.id, username: user.username, email: user.email },
    opts.jwtSecret,
    opts.jwtExpiresIn,
  );

  return {
    status: 200,
    body: { token, user },
  };
}

