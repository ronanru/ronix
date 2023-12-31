import { library } from '@/library';
import { navigate } from '@/router';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Show, type Component } from 'solid-js';
import SongList from './songList';

const AlbumPage: Component<{ albumId: string }> = (props) => {
  const album = () => library()?.albums[props.albumId];
  const artist = () => library()?.artists[album()?.artist as string];

  return (
    <div>
      <Show when={album()?.cover_art}>
        <img
          src={convertFileSrc(album()?.cover_art as string)}
          alt=""
          class="h-64 w-full rounded-lg object-cover object-center"
        />
      </Show>
      <h1
        class="text-5xl font-bold"
        classList={{
          'mt-16': !album()?.cover_art,
          'mt-8': !!album()?.cover_art,
        }}
      >
        {album()?.name}
      </h1>
      <p class="mt-2 text-2xl">
        by{' '}
        <button
          role="link"
          class="hover:underline"
          onClick={() =>
            navigate({
              name: 'artist',
              data: album()?.artist as string,
            })
          }
        >
          {artist()?.name}
        </button>
      </p>
      <section aria-label="Songs" class="mt-8">
        <h2 class="mb-4 text-2xl font-bold">Songs</h2>
        <SongList album={props.albumId} />
      </section>
    </div>
  );
};

export default AlbumPage;
