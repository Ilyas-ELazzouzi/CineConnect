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

  res.status(500).json({ error: 'Erreur serveur' });
}

