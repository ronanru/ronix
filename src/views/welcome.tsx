import FolderList from '@/components/folderList';
import Button from '@/components/ui/button';
import { Show, createSignal, type Component } from 'solid-js';
import { api } from '../api';
import { setConfig } from '../config';

const Welcome: Component = () => {
  const [folders, setFolders] = createSignal<string[]>([]);

  api.query(['config.getDefaultMusicFolder']).then((folder) => {
    setFolders((f) => [...f, folder]);
  });

  return (
    <div class="m-6 w-full max-w-md space-y-4 rounded-2xl bg-primary-900 p-6 shadow-xl">
      <h1 class="text-2xl font-bold">Welcome to Ronix!</h1>
      <p>Please select the directories where you store your music.</p>
      <FolderList folders={folders()} onChange={setFolders} />
      <Show when={folders().length}>
        <Button
          variant="accent"
          onClick={() =>
            setConfig({
              music_folders: folders(),
              accent_color: 'Emerald',
              dark_mode: true,
              main_color: 'Zinc',
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
