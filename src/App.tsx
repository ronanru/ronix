import { Show, Suspense, type Component } from 'solid-js';
import { config } from './config';
import Library from './views/library';
import Loading from './views/loading';
import Welcome from './views/welcome';

const App: Component = () => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Show fallback={<Welcome />} when={config()?.music_folders.length}>
          <Library />
        </Show>
      </Suspense>
    </>
  );
};

export default App;
