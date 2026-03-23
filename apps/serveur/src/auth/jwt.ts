import jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
};

export type RefreshJwtPayload = {
  sub: string;
};

export function signAccessToken(payload: JwtPayload, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function signRefreshToken(payload: RefreshJwtPayload, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('JWT invalide');
  }
  const { sub, username, email } = decoded as Record<string, unknown>;
  if (typeof sub !== 'string' || typeof username !== 'string' || typeof email !== 'string') {
    throw new Error('JWT payload invalide');
  }
  return { sub, username, email };
}

export function verifyRefreshToken(token: string, secret: string): RefreshJwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Refresh JWT invalide');
  }
  const { sub } = decoded as Record<string, unknown>;
  if (typeof sub !== 'string') {
    throw new Error('Refresh JWT payload invalide');
  }
  return { sub };
}

