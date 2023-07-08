import { library } from '@/library';
import { navigate } from '@/router';
import { For, type Component } from 'solid-js';

const ArtistList: Component<{
  artists?: string[];
}> = (props) => {
  const artists = () =>
    Object.entries(library()?.artists || {})
      .filter(([id]) => !props.artists || props.artists.includes(id))
      .map(([id, artist]) => ({
        id,
        ...artist,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
      <For
        each={artists()}
        fallback={<p class="text-center">No artists found</p>}
      >
        {(artist) => (
          <button
            role="link"
            class="items-center overflow-hidden rounded-3xl bg-primary-900 p-4 transition-colors hover:bg-primary-800"
            onClick={() =>
              navigate({
                name: 'artist',
                data: artist.id,
              })
            }
          >
            <p class="truncate">{artist.name}</p>
          </button>
        )}
      </For>
    </div>
  );
};

export default ArtistList;
