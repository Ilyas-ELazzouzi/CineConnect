import { describe, expect, it } from 'vitest';
import {
  convertImdbRatingTo5,
  mapGenresToCategories,
  transformOMDbMovie,
  type OMDbMovie,
} from '@/lib/omdb';
import { LoginSchema, RegisterSchema } from '@/lib/validators/auth';

function minimalOmdbMovie(overrides: Partial<OMDbMovie> = {}): OMDbMovie {
  return {
    imdbID: 'tt1234567',
    Title: 'Test Movie',
    Year: '2020',
    Poster: 'https://example.com/poster.jpg',
    Response: 'True',
    Type: 'movie',
    ...overrides,
  };
}

describe('client: validators (auth)', () => {
  it('LoginSchema normalise email et accepte un couple valide', () => {
    const parsed = LoginSchema.parse({
      email: '  User@EXAMPLE.com ',
      password: 'secret',
    });
    expect(parsed.email).toBe('user@example.com');
    expect(parsed.password).toBe('secret');
  });

  it('LoginSchema rejette un email invalide', () => {
    const result = LoginSchema.safeParse({ email: 'pas-un-email', password: 'x' });
    expect(result.success).toBe(false);
  });

  it('RegisterSchema exige un mot de passe d’au moins 6 caractères', () => {
    const result = RegisterSchema.safeParse({
      username: 'alice',
      email: 'a@b.co',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('RegisterSchema accepte inscription valide', () => {
    const parsed = RegisterSchema.parse({
      username: '  alice  ',
      email: 'Alice@Example.com',
      password: 'secret12',
    });
    expect(parsed.username).toBe('alice');
    expect(parsed.email).toBe('alice@example.com');
  });
});

describe('client: omdb helpers', () => {
  it('convertImdbRatingTo5 convertit la note /10 vers /5', () => {
    expect(convertImdbRatingTo5('10')).toBe(5);
    expect(convertImdbRatingTo5('8.4')).toBe(4.2);
    expect(convertImdbRatingTo5('invalid')).toBe(0);
  });

  it('mapGenresToCategories mappe les genres OMDb vers les catégories app', () => {
    expect(mapGenresToCategories('Action, Drama')).toEqual(['action', 'drame']);
    expect(mapGenresToCategories(undefined)).toEqual([]);
  });

  it('transformOMDbMovie mappe un film OMDb vers TransformedMovie', () => {
    const film = transformOMDbMovie(
      minimalOmdbMovie({
        imdbRating: '8.0',
        Genre: 'Thriller',
        Director: 'Jane Doe',
        Plot: 'Synopsis.',
      }),
    );
    expect(film.id).toBe('tt1234567');
    expect(film.title).toBe('Test Movie');
    expect(film.year).toBe(2020);
    expect(film.rating).toBe(4);
    expect(film.categories).toEqual(['thriller']);
    expect(film.director).toBe('Jane Doe');
  });

  it('transformOMDbMovie ignore N/A et années invalides', () => {
    const film = transformOMDbMovie(
      minimalOmdbMovie({
        Year: '2010–2015',
        Poster: 'N/A',
        Director: 'N/A',
        Plot: undefined,
        imdbRating: undefined,
      }),
    );
    expect(film.year).toBe(2010);
    expect(film.poster).toBeUndefined();
    expect(film.director).toBeUndefined();
    expect(film.rating).toBe(0);
  });
});
