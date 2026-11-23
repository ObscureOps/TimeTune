import type { Song } from "../types/song";

/**
 * Shuffle a collection of songs using Fisher-Yates.
 * Returns a new array without mutating the original.
 */
export function shuffleSongs(songs: Song[]): Song[] {
  const shuffled = [...songs];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Get a random song from the collection.
 */
export function getRandomSong(songs: Song[]): Song | undefined {
  if (songs.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * songs.length);

  return songs[randomIndex];
}

/**
 * Get a random song that has not already been used
 * and has a configured YouTube video ID.
 *
 * Songs without a YouTube ID are excluded so that
 * playback testing can proceed without encountering
 * unconfigured songs.
 */
export function getRandomUnusedSong(
  songs: Song[],
  usedSongIds: string[]
): Song | undefined {
  const usedIds = new Set(usedSongIds);

  const availableSongs = songs.filter(
    (song) =>
      !usedIds.has(song.id) &&
      typeof song.youtubeId === "string" &&
      song.youtubeId.trim().length > 0
  );

  return getRandomSong(availableSongs);
}

/**
 * Sort songs chronologically.
 */
export function sortSongsByYear(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => a.year - b.year);
}

/**
 * Filter songs by decade.
 *
 * Example:
 * getSongsByDecade(songs, 1990)
 * returns songs released from 1990 through 1999.
 */
export function getSongsByDecade(
  songs: Song[],
  decade: number
): Song[] {
  return songs.filter(
    (song) => song.year >= decade && song.year < decade + 10
  );
}

/**
 * Get all songs from a specific genre.
 */
export function getSongsByGenre(
  songs: Song[],
  genre: string
): Song[] {
  return songs.filter(
    (song) => song.genre.toLowerCase() === genre.toLowerCase()
  );
}

/**
 * Find a song by its unique ID.
 */
export function getSongById(
  songs: Song[],
  id: string
): Song | undefined {
  return songs.find((song) => song.id === id);
}

/**
 * Check whether a song can be correctly placed
 * at the selected position in a chronological timeline.
 *
 * position is zero-based.
 *
 * Example:
 * Timeline: [1980, 1990, 2000]
 * Position: 1
 * Song: 1995
 *
 * Result: true
 */
export function isCorrectPlacement(
  song: Song,
  timeline: Song[],
  position: number
): boolean {
  if (position < 0 || position > timeline.length) {
    return false;
  }

  const previousSong = timeline[position - 1];
  const nextSong = timeline[position];

  const isAfterPrevious =
    !previousSong || song.year >= previousSong.year;

  const isBeforeNext =
    !nextSong || song.year <= nextSong.year;

  return isAfterPrevious && isBeforeNext;
}

/**
 * Return the correct chronological insertion position
 * for a song in an existing timeline.
 */
export function getCorrectInsertionIndex(
  song: Song,
  timeline: Song[]
): number {
  return timeline.findIndex(
    (timelineSong) => song.year < timelineSong.year
  ) === -1
    ? timeline.length
    : timeline.findIndex(
        (timelineSong) => song.year < timelineSong.year
      );
}

/**
 * Return a readable decade label.
 *
 * Example:
 * 1990 -> "1990s"
 */
export function getDecadeLabel(year: number): string {
  const decade = Math.floor(year / 10) * 10;

  return `${decade}s`;
}

/**
 * Check if all songs have unique IDs.
 */
export function hasUniqueSongIds(songs: Song[]): boolean {
  const ids = songs.map((song) => song.id);

  return new Set(ids).size === ids.length;
}

/**
 * Return all available genres.
 */
export function getAllGenres(songs: Song[]): string[] {
  return [...new Set(songs.map((song) => song.genre))].sort();
}

/**
 * Return all available decades.
 */
export function getAllDecades(songs: Song[]): number[] {
  const decades = songs.map(
    (song) => Math.floor(song.year / 10) * 10
  );

  return [...new Set(decades)].sort((a, b) => a - b);
}
