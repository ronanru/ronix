import { library } from '@/library';
import { navigate } from '@/router';
import { For, Show, type Component } from 'solid-js';
import CoverArt from '../components/coverArt';

const AlbumList: Component<{
  albums?: string[];
  isOnArtistPage?: boolean;
}> = (props) => {
  const albums = () =>
    Object.entries(library()?.albums || {})
      .filter(([id]) => !props.albums || props.albums.includes(id))
      .map(([id, album]) => {
        const artist = library()?.artists[album.artist];
        if (!artist) return null;
        return {
          ...album,
          id,
          artist: artist.name,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
      <For
        each={albums()}
        fallback={<p class="text-center">No albums found</p>}
      >
        {(album) => (
          <button
            role="link"
            class="flex flex-col items-stretch gap-2 overflow-hidden rounded-3xl bg-primary-900 p-4 transition-colors hover:bg-primary-800"
            onClick={() =>
              navigate({
                name: 'album',
                data: album.id,
              })
            }
          >
            <CoverArt src={album.cover_art} class="rounded-2xl" />
            <p class="truncate text-center font-bold">{album.name}</p>
            <Show when={!props.isOnArtistPage}>
              <button
                role="link"
                class="block truncate text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({
                    name: 'artist',
                    data: album.artist,
                  });
                }}
              >
                {album.artist}
              </button>
            </Show>
          </button>
        )}
      </For>
    </div>
  );
};

export default AlbumList;
