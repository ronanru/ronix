import { api } from '@/api';
import { DeleteIcon, PlusIcon } from 'lucide-solid';
import { For, type Component } from 'solid-js';
import Button from './ui/button';

const FolderList: Component<{
  folders: string[];
  onChange?: (folders: string[]) => void;
}> = (props) => {
  const addFolder = (folder: string | null) =>
    folder &&
    !props.folders.includes(folder) &&
    props.onChange?.([...props.folders, folder as string]);

  return (
    <div class="space-y-4">
      <For each={props.folders}>
        {(folder) => (
          <div class="flex w-full gap-4">
            <div class="flex-1 truncate rounded-lg bg-primary-800 px-4 py-2">
              {folder}
            </div>
            <Button
              onClick={() =>
                props.onChange?.(props.folders.filter((x) => x !== folder))
              }
            >
              <DeleteIcon />
            </Button>
          </div>
        )}
      </For>
      <Button
        onClick={() => api.query(['config.pickFolder']).then(addFolder)}
        class="w-full"
      >
        <PlusIcon />
        Add folder
      </Button>
    </div>
  );
};

export default FolderList;
