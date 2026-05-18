import type { Track } from "../models";

/**
 * Default playlist for the wedding player
 * Collection of placeholder tracks - will be replaced with Spotify/actual data later
 */
export const DEFAULT_PLAYLIST: Track[] = [
  {
    id: 1,
    title: "First Dance",
    artist: "Our Song",
    url: "assets/placeholder.mp3",
    duration: 0,
  },
  {
    id: 2,
    title: "Seven Years Together",
    artist: "Love Story",
    url: "assets/placeholder.mp3",
    duration: 0,
  },
  {
    id: 3,
    title: "Forever Yours",
    artist: "Wedding Gift",
    url: "assets/placeholder.mp3",
    duration: 0,
  },
];
