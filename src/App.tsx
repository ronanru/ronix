import { debounce } from '@solid-primitives/scheduled';
import { ChevronLeftIcon, Search } from 'lucide-solid';
import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  lazy,
  onCleanup,
  type Component,
} from 'solid-js';
import Controls from './components/controls';
import Button from './components/ui/button';
import { config } from './config';
import { MainPages, currentPage, goBack, navigate } from './router';
import AlbumList from './views/albumList';
import AlbumPage from './views/albumPage';
import ArtistPage from './views/artistPage';
import ArtistList from './views/artistsList';
import Loading from './views/loading';
import SearchPage from './views/searchPage';
import SongList from './views/songList';

const Welcome = lazy(() => import('./views/welcome'));

const App: Component = () => {
  const setSearch = debounce(
    (data: string) =>
      navigate({
        name: 'search',
        data,
      }),
    250
  );

  const onSearchBarInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    const query = e.currentTarget.value;
    if (query) setSearch(query);
    else {
      setSearch.clear();
      goBack();
    }
  };

  onCleanup(() => setSearch.clear());

  return (
    <Suspense fallback={<Loading />}>
      <Show fallback={<Welcome />} when={config()?.music_folders.length}>
        <header class="flex w-full gap-4 p-4">
          <Show when={!MainPages.includes(currentPage().name)}>
            <Button role="link" onClick={goBack} aria-label="Back to songs">
              <ChevronLeftIcon />
            </Button>
          </Show>
          <div class="flex w-full items-center rounded-lg bg-primary-800 focus-within:outline-accent-600">
            <Search class="ml-2" />
            <input
              type="text"
              class="rounded-lg bg-transparent px-4 py-2 caret-accent-600 focus-visible:outline-none"
              placeholder="Search"
              onInput={onSearchBarInput}
            />
          </div>
        </header>
        <Show
          when={['songs', 'albums', 'artists'].includes(currentPage().name)}
        >
          <div class="mb-4 grid w-full grid-cols-3 gap-4 px-4">
            <For each={['songs', 'albums', 'artists'] as const}>
              {(name) => (
                <Button
                  variant={currentPage().name === name ? 'light' : 'default'}
                  class="p-4 text-center capitalize"
                  role="link"
                  aria-current={
                    currentPage().name === name ? 'page' : undefined
                  }
                  onClick={() => navigate({ name })}
                >
                  {name}
                </Button>
              )}
            </For>
          </div>
        </Show>
        <main class="w-full flex-1 overflow-y-auto px-4">
          <div class="mb-2">
            <Switch>
              <Match when={currentPage().name === 'songs'}>
                <SongList />
              </Match>
              <Match when={currentPage().name === 'albums'}>
                <AlbumList />
              </Match>
              <Match when={currentPage().name === 'artists'}>
                <ArtistList />
              </Match>
              <Match when={currentPage().name === 'artist'}>
                <ArtistPage artistId={currentPage().data as string} />
              </Match>
              <Match when={currentPage().name === 'album'}>
                <AlbumPage albumId={currentPage().data as string} />
              </Match>
              <Match when={currentPage().name === 'search'}>
                <SearchPage query={currentPage().data as string} />
              </Match>
            </Switch>
          </div>
        </main>
        <Controls />
      </Show>
    </Suspense>
  );
};

export default App;
