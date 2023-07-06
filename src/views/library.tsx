import Controls from '@/components/controls';
import SongButton from '@/components/songButton';
import { library } from '@/library';
import { For, type Component } from 'solid-js';

const Library: Component = () => {
  const songs = () =>
    Object.entries(library()?.songs || {})
      .map(([id, song]) => {
        let album = library()?.albums[song.album]!;
        let artist = library()?.artists[album.artist]!;
        return {
          ...song,
          id,
          album: album.name,
          artist: artist.name,
          cover_art: album.cover_art,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <div class="w-full flex-1 overflow-scroll px-4">
        <For each={songs()}>{(song) => <SongButton {...song} />}</For>
      </div>
      <Controls />
    </>
  );
};

export default Library;
