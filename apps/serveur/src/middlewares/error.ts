import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation échouée',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const message =
    process.env.NODE_ENV !== 'production' && err instanceof Error ? err.message : 'Erreur serveur';
  res.status(500).json({ error: message });
}

