import Button from '@/components/ui/button';
import { Delete, Plus } from 'lucide-solid';
import {
  For,
  Show,
  createEffect,
  createSignal,
  type Component,
} from 'solid-js';
import { api } from '../api';
import { setConfig } from '../config';

const Welcome: Component = () => {
  const [folders, setFolders] = createSignal<string[]>([]);

  createEffect(() => {
    api.query(['config.getDefaultMusicFolder']).then((folder) => {
      setFolders((f) => [...f, folder]);
    });
  });

  return (
    <div class="m-6 w-full max-w-md space-y-4 rounded-2xl bg-primary-900 p-6 shadow-xl">
      <h1 class="text-2xl font-bold">Welcome to Ronix!</h1>
      <p>Please select the directories where you store your music.</p>
      <For each={folders()}>
        {(folder) => (
          <div class="flex w-full gap-4">
            <div class="flex-1 truncate rounded-lg bg-primary-800 px-4 py-2">
              {folder}
            </div>
            <Button
              onClick={() => setFolders((f) => f.filter((x) => x !== folder))}
            >
              <Delete />
            </Button>
          </div>
        )}
      </For>
      <Button
        onClick={async () => {
          let folder = await api.query(['config.pickFolder']);
          if (folder && !folders().includes(folder))
            setFolders((f) => [...f, folder as string]);
        }}
        class="w-full"
      >
        <Plus />
        Add folder
      </Button>
      <Show when={folders().length}>
        <Button
          variant="accent"
          onClick={() =>
            setConfig({
              music_folders: folders(),
            })
          }
          class="mx-auto"
        >
          START USING RONIX
        </Button>
      </Show>
    </div>
  );
};

export default Welcome;
