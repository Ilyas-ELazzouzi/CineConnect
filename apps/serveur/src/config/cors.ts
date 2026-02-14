import type { Request } from 'express';

export function parseCorsOrigins(origins: string[]) {
  const allowed = new Set(origins);
  return function isAllowed(origin: string | undefined) {
    if (!origin) return false;
    return allowed.has(origin);
  };
}

export function originFromRequest(req: Request) {
  const originHeader = req.header('origin');
  return originHeader || undefined;
}
