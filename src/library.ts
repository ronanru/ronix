import { createResource } from 'solid-js';
import { api } from './api';
import type { Library, Song } from './gen/tauri-types';

export type FullSong = Song & {
  id: string;
  artist: string;
  album: string;
  cover_art: string | null;
};

const [library, { refetch }] = createResource<Library>(() =>
  api.query(['getLibrary'])
);

export const refetchLibrary = refetch;

export { library };
