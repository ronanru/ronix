import { api } from '@/api';
import { library } from '@/library';
import { For, type Component } from 'solid-js';
import CoverArt from './coverArt';

const SongList: Component<{
  songs?: string[];
}> = (props) => {
  const songs = () =>
    Object.entries(library()?.songs || {})
      .filter(([id]) => !props.songs || props.songs.includes(id))
      .map(([id, song]) => {
        const album = library()?.albums[song.album];
        if (!album) return null;
        const artist = library()?.artists[album.artist];
        if (!artist) return null;
        return {
          ...song,
          id,
          album: album.name,
          artist: artist.name,
          cover_art: album.cover_art,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div class="flex flex-col overflow-x-hidden">
      <For each={songs()} fallback={<p class="text-center">No songs found</p>}>
        {(song) => (
          <button
            onClick={() =>
              api.mutation([
                'player.playSong',
                {
                  scope: 'Library',
                  song_id: song.id,
                },
              ])
            }
            class="flex max-w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-primary-900"
          >
            <CoverArt
              src={song.cover_art}
              class="h-12 w-12 flex-shrink-0 rounded-lg"
            />
            <div class="flex-shrink flex-grow overflow-hidden text-left">
              <p class="truncate font-bold">{song.title}</p>
              <p class="truncate">{song.artist}</p>
            </div>
            <p class="flex-shrink-0">
              {Math.floor(song.duration / 60)}:
              {(song.duration % 60).toString().padStart(2, '0')}
            </p>
          </button>
        )}
      </For>
    </div>
  );
};

export default SongList;
