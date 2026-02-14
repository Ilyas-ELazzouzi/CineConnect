const OMDB_BASE_URL = 'https://www.omdbapi.com/';

type OmdbEnv = {
  omdbApiKey: string | undefined;
};

function pickQueryParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  return value === null ? undefined : value;
}

export async function proxyOmdb({
  env,
  path,
  url,
}: {
  env: OmdbEnv;
  path: string;
  url: URL;
}): Promise<{ status: number; body: unknown }> {
  if (!env.omdbApiKey) {
    return { status: 500, body: { error: 'OMDB_API_KEY manquant côté serveur.' } };
  }

  const upstream = new URL(OMDB_BASE_URL);
  upstream.searchParams.set('apikey', env.omdbApiKey);

  if (path === '/api/omdb/search') {
    const s = pickQueryParam(url, 's') || pickQueryParam(url, 'query');
    const page = pickQueryParam(url, 'page') || '1';
    if (!s || s.trim().length < 1) return { status: 400, body: { error: 'Paramètre "s" requis.' } };
    upstream.searchParams.set('s', s);
    upstream.searchParams.set('type', 'movie');
    upstream.searchParams.set('page', page);
  } else if (path.startsWith('/api/omdb/movie/')) {
    const imdbId = decodeURIComponent(path.slice('/api/omdb/movie/'.length));
    if (!imdbId) return { status: 400, body: { error: 'imdbId requis.' } };
    upstream.searchParams.set('i', imdbId);
    upstream.searchParams.set('plot', 'full');
  } else {
    return { status: 404, body: { error: 'Route OMDb inconnue.' } };
  }

  const response = await fetch(upstream, { method: 'GET', headers: { accept: 'application/json' } });
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return { status: response.status, body: parsed };
  } catch {
    return { status: 502, body: { error: 'Réponse OMDb non-JSON.', raw: raw.slice(0, 200) } };
  }
}
