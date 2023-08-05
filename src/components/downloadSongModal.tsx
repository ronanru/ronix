import { api } from '@/api';
import { refetchLibrary } from '@/library';
import { XIcon } from 'lucide-solid';
import {
  Match,
  Switch,
  createEffect,
  createSignal,
  type Component,
} from 'solid-js';
import Button from './ui/button';

const DownloadSongModal: Component<{ isOpen: boolean; onClose: () => void }> = (
  props,
) => {
  const [stage, setStage] = createSignal<'input' | 'loading' | 'success'>(
    'input',
  );
  const [error, setError] = createSignal<string | null>(null);

  const onSearchSubmit = async (
    e: Event & { currentTarget: HTMLFormElement },
  ) => {
    e.preventDefault();
    const query = e.currentTarget.querySelector('input')?.value;
    alert('123123');
    if (!query) return;
    setStage('loading');
    api
      .query(['download.download', query])
      .then(() => {
        refetchLibrary();
        setStage('success');
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  let dialog: HTMLDialogElement;

  createEffect(() => {
    dialog[props.isOpen ? 'showModal' : 'close']();
  });

  return (
    <dialog
      ref={dialog!}
      class="w-full max-w-md space-y-4 rounded-xl bg-primary-900 p-6 backdrop:backdrop-blur"
    >
      <Switch>
        <Match when={error()}>
          <div class="flex justify-between">
            <h1 class="text-xl font-bold">Download failed</h1>
            <Button
              onClick={props.onClose}
              variant="ghost"
              size="icon"
              class="relative -right-2 -top-2 p-1"
            >
              <XIcon />
            </Button>
          </div>
          <p>{error()}</p>
        </Match>
        <Match when={stage() === 'input'}>
          <div class="flex justify-between">
            <h1 class="text-xl font-bold">Download Song</h1>
            <Button
              onClick={props.onClose}
              variant="ghost"
              size="icon"
              class="relative -right-2 -top-2 p-1"
            >
              <XIcon />
            </Button>
          </div>
          <div>
            <form onSubmit={onSearchSubmit} class="space-y-2">
              <label for="downloadSearch">
                Song URL (YouTube, SoundCloud, YT Music, etc.)
              </label>
              <input
                class="w-full rounded-lg bg-primary-800 px-4 py-2 caret-accent-600 placeholder:text-primary-700"
                type="url"
                id="downloadSearch"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <Button variant="accent" type="submit" class="w-full">
                Download
              </Button>
            </form>
          </div>
        </Match>
        <Match when={stage() === 'loading'}>
          <h1 class="text-xl font-bold">Downloading...</h1>
        </Match>
        <Match when={stage() === 'success'}>
          <div class="flex justify-between">
            <h1 class="text-xl font-bold">Downloaded!</h1>
            <Button
              onClick={props.onClose}
              variant="ghost"
              size="icon"
              class="relative -right-2 -top-2 p-1"
            >
              <XIcon />
            </Button>
          </div>
        </Match>
      </Switch>
    </dialog>
  );
};

export default DownloadSongModal;