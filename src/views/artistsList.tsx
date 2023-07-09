import { library } from '@/library';
import { navigate } from '@/router';
import { For, type Component } from 'solid-js';

const ArtistList: Component<{
  ids?: string[];
  noSort?: boolean;
}> = (props) => {
  const artists = () => {
    let entries = Object.entries(library()?.artists || {});
    if (props.ids) entries = entries.filter(([id]) => props.ids!.includes(id));
    let artists = entries.map(([id, artist]) => ({
      id,
      ...artist,
    }));
    if (!props.noSort)
      artists = artists.sort((a, b) => a.name.localeCompare(b.name));
    return artists;
  };

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
