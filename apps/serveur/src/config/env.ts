import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

function parseEnvFile(text: string) {
  const lines = text.split(/\r?\n/);
  const result: Record<string, string> = {};
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

export function loadDotEnv({ cwd = process.cwd(), filename = '.env' } = {}) {
  const envPath = path.join(cwd, filename);
  if (!fs.existsSync(envPath)) return;
  const file = fs.readFileSync(envPath, 'utf8');
  const parsed = parseEnvFile(file);
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL requis'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET trop court (>= 16)'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OMDB_API_KEY: z.string().optional(),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://127.0.0.1:5173')
    .transform((value) => value.split(',').map((s) => s.trim()).filter(Boolean)),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Configuration invalide:\n${message}`);
  }
  return parsed.data;
}
