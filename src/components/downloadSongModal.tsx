import { api } from '@/api';
import { refetchLibrary } from '@/library';
import { Show, createEffect, createSignal, on, type Component } from 'solid-js';
import Button from './ui/button';
import Modal from './ui/modal';

const DownloadSongModal: Component<{ isOpen: boolean; onClose: () => void }> = (
  props,
) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [returnText, setReturnText] = createSignal<string | null>(null);

  const onSearchSubmit = async (
    e: Event & { currentTarget: HTMLFormElement },
  ) => {
    e.preventDefault();
    const query = e.currentTarget.querySelector('input')?.value;
    if (!query) return;
    setIsLoading(true);
    api.query(['download.download', query]).then((text) => {
      refetchLibrary();
      setReturnText(text);
    });
  };

  createEffect(
    on(
      () => props.isOpen,
      () => {
        setReturnText(null);
        setIsLoading(false);
      },
    ),
  );

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={returnText() ?? (isLoading() ? 'Downloading...' : 'Download Song')}
      disableClosing={isLoading() && !returnText()}
    >
      <Show when={!returnText() && !isLoading()}>
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
      </Show>
    </Modal>
  );
};

export default DownloadSongModal;
