import { api } from '@/api';
import { library } from '@/library';
import { For, Show, type Component } from 'solid-js';
import CoverArt from '../components/coverArt';

const SongList: Component<{
  albums?: string[];
  album?: string;
}> = (props) => {
  const songs = () => {
    let entries = Object.entries(library()?.songs || {});
    if (props.albums)
      entries = entries.filter(([, song]) =>
        props.albums!.includes(song.album)
      );
    else if (props.album)
      entries = entries.filter(([, song]) => song.album === props.album);
    return entries.map(([id, song]) => {
      const album = library()!.albums[song.album]!;
      const artist = library()!.artists[album.artist]!;
      return {
        ...song,
        album_id: song.album,
        artist_id: album.artist,
        cover_art: album.cover_art,
        artist: artist.name,
        id,
      };
    });
  };

  return (
    <div class="flex flex-col overflow-x-hidden">
      <For each={songs()} fallback={<p class="text-center">No songs found</p>}>
        {(song) => (
          <button
            onClick={() =>
              api.mutation([
                'player.playSong',
                {
                  scope: props.albums
                    ? {
                        Artist: song.artist_id,
                      }
                    : props.album
                    ? {
                        Album: song.album_id,
                      }
                    : 'Library',
                  song_id: song.id,
                },
              ])
            }
            class="flex max-w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-primary-900"
          >
            <Show when={!props.album}>
              <CoverArt
                src={song.cover_art}
                class="h-12 w-12 flex-shrink-0 rounded-lg"
              />
            </Show>
            <div class="flex-shrink flex-grow overflow-hidden text-left">
              <p class="truncate font-bold">{song.title}</p>
              <Show when={!props.albums && !props.album}>
                <button class="block truncate">{song.artist}</button>
              </Show>
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
