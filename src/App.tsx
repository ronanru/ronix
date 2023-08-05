import { debounce } from '@solid-primitives/scheduled';
import { ChevronLeftIcon, PlusIcon, Search, SettingsIcon } from 'lucide-solid';
import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createSignal,
  lazy,
  onCleanup,
  type Component,
} from 'solid-js';
import Controls from './components/controls';
import DownloadSongModal from './components/downloadSongModal';
import Button from './components/ui/button';
import { config, generateCssVariables } from './config';
import { currentPage, goBack, navigate } from './router';
import AlbumList from './views/albumList';
import AlbumPage from './views/albumPage';
import ArtistPage from './views/artistPage';
import ArtistList from './views/artistsList';
import Loading from './views/loading';
import SearchPage from './views/searchPage';
import Settings from './views/settings';
import SongList from './views/songList';

const Welcome = lazy(() => import('./views/welcome'));

const App: Component = () => {
  let searchInput: HTMLInputElement;

  const setSearch = debounce(
    (data: string) =>
      navigate({
        name: 'search',
        data,
      }),
    250,
  );

  const onSearchBarInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    const query = e.currentTarget.value;
    if (query) setSearch(query);
    else {
      setSearch.clear();
      goBack();
    }
  };

  createEffect(() => {
    const conf = config();
    if (!conf) return;
    const cssVars = generateCssVariables(
      conf.main_color,
      conf.accent_color,
      conf.dark_mode,
    );
    for (const key in cssVars) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (key.startsWith('--'))
        document.documentElement.style.setProperty(
          key,
          cssVars[key as any] as any,
        );
      else
        document.documentElement.style[key as any] = cssVars[key as any] as any;
      /* eslint-enable */
    }
  });

  onCleanup(() => setSearch.clear());

  const [isDownloadModalOpen, setIsDownloadModalOpen] = createSignal(false);

  return (
    <Suspense fallback={<Loading />}>
      <Show fallback={<Welcome />} when={config()?.music_folders.length}>
        <DownloadSongModal
          isOpen={isDownloadModalOpen()}
          onClose={() => setIsDownloadModalOpen(false)}
        />
        <header class="flex w-full items-center gap-4 p-4">
          <Show
            when={!['songs', 'albums', 'artists'].includes(currentPage().name)}
          >
            <Button
              role="link"
              onClick={() => {
                goBack();
                searchInput.value = '';
              }}
              aria-label="Back"
            >
              <ChevronLeftIcon />
            </Button>
          </Show>
          <Show
            when={currentPage().name !== 'settings'}
            fallback={
              <h1 class="flex-1 text-4xl font-bold capitalize">
                {currentPage().name}
              </h1>
            }
          >
            <div class="flex w-full items-center rounded-lg bg-primary-800 focus-within:outline-accent-600">
              <Search class="ml-2" />
              <input
                type="text"
                ref={searchInput!}
                class="w-full rounded-lg bg-transparent px-4 py-2 caret-accent-600 focus-visible:outline-none"
                placeholder="Search"
                onInput={onSearchBarInput}
              />
            </div>
          </Show>
          <Show when={currentPage().name !== 'settings'}>
            <Button
              role="link"
              size="icon"
              onClick={() =>
                navigate({
                  name: 'settings',
                })
              }
            >
              <SettingsIcon />
            </Button>
            <Button
              role="link"
              size="icon"
              onClick={() => setIsDownloadModalOpen(true)}
            >
              <PlusIcon />
            </Button>
          </Show>
        </header>
        <Show
          when={['songs', 'albums', 'artists'].includes(currentPage().name)}
        >
          <nav class="mb-4 grid w-full grid-cols-3 gap-4 px-4">
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
          </nav>
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
              <Match when={currentPage().name === 'settings'}>
                <Settings />
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
