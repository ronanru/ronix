import { Search } from 'lucide-solid';
import { Match, Show, Suspense, Switch, lazy, type Component } from 'solid-js';
import Controls from './components/controls';
import SongList from './components/songList';
import { config } from './config';
import { currentPage } from './router';
import Loading from './views/loading';

const Welcome = lazy(() => import('./views/welcome'));

const App: Component = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Show fallback={<Welcome />} when={config()?.music_folders.length}>
        <div class="w-full p-4">
          <div class="flex w-full items-center rounded-lg bg-primary-800 focus-within:outline-accent-600">
            <Search class="ml-2" />
            <input
              type="text"
              class="rounded-lg bg-transparent px-4 py-2 focus-visible:outline-none"
              placeholder="Search"
            />
          </div>
        </div>
        <div class="w-full flex-1 overflow-y-auto px-4">
          <Switch>
            <Match when={currentPage().name === 'songs'}>
              <SongList />
            </Match>
          </Switch>
        </div>
        <Controls />
      </Show>
    </Suspense>
  );
};

export default App;
