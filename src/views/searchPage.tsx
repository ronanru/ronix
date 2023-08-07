import { api } from '@/api';
import { SearchResults } from '@/gen/tauri-types';
import { Show, createEffect, createSignal, on, type Component } from 'solid-js';
import AlbumList from './albumList';
import ArtistList from './artistsList';
import Loading from './loading';
import SongList from './songList';

const SearchPage: Component<{ query: string }> = (props) => {
  const [searchResults, setSearchResults] = createSignal<SearchResults | null>(
    null,
  );

  createEffect(
    on(
      () => props.query,
      (query) => api.query(['library.search', query]).then(setSearchResults),
    ),
  );

  return (
    <Show when={searchResults()} fallback={<Loading />}>
      <h1 class="sr-only">Search Results</h1>
      <Show when={searchResults()?.artists}>
        <section aria-label="Artists" class="mt-8">
          <h2 class="mb-4 text-2xl font-bold">Artists</h2>
          <ArtistList ids={searchResults()?.artists} noSort />
        </section>
      </Show>
      <Show when={searchResults()?.albums}>
        <section aria-label="Albums" class="mt-8">
          <h2 class="mb-4 text-2xl font-bold">Albums</h2>
          <AlbumList ids={searchResults()?.albums} noSort />
        </section>
      </Show>
      <Show when={searchResults()?.songs}>
        <section aria-label="Songs" class="mt-8">
          <h2 class="mb-4 text-2xl font-bold">Songs</h2>
          <SongList ids={searchResults()?.songs} noSort />
        </section>
      </Show>
    </Show>
  );
};

export default SearchPage;
