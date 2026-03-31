import { beforeEach, vi } from 'vitest';

const storage: Record<string, string> = {};

beforeEach(() => {
  for (const k of Object.keys(storage)) {
    delete storage[k];
  }
});

vi.stubGlobal(
  'localStorage',
  {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const k of Object.keys(storage)) {
        delete storage[k];
      }
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
  } as Storage,
);
