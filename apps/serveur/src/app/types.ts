import type { Env } from '../config/env.js';
import type { Db } from '../db/client.js';

export type AppDependencies = {
  env: Env;
  db?: Db;
};
