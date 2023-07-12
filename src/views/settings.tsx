import ColorInput from '@/components/colorInput';
import FolderList from '@/components/folderList';
import Button from '@/components/ui/button';
import {
  generateCssVariables,
  config as globalConfig,
  setConfig as setGlobalConfig,
} from '@/config';
import { Config } from '@/gen/tauri-types';
import { goBack } from '@/router';
import SongButton from '@/songButton';
import { type Component } from 'solid-js';
import { createStore } from 'solid-js/store';

const Settings: Component = () => {
  const [config, setConfig] = createStore<Config>(globalConfig()!);

  return (
    <div>
      <p class="mb-4 text-xl font-semibold">Music Folders</p>
      <FolderList
        folders={config.music_folders}
        onChange={(folders) => setConfig('music_folders', folders)}
      />
      <ColorInput
        onChange={(v) => setConfig('dark_mode', v === 'Dark' ? true : false)}
        value={config.dark_mode ? 'Dark' : 'Light'}
        label="Color Scheme"
        colors={[
          {
            bgClass: 'bg-primary-100',
            name: 'Light',
          },
          {
            bgClass: 'bg-primary-900',
            name: 'Dark',
          },
        ]}
      />
      <ColorInput
        onChange={(v) => setConfig('main_color', v as Config['main_color'])}
        value={config.main_color}
        label="Main Color"
        colors={[
          {
            bgClass: 'bg-slate-500',
            name: 'Slate',
          },
          {
            bgClass: 'bg-gray-500',
            name: 'Gray',
          },
          {
            bgClass: 'bg-zinc-500',
            name: 'Zinc',
          },
          {
            bgClass: 'bg-neutral-500',
            name: 'Neutral',
          },
          {
            bgClass: 'bg-stone-500',
            name: 'Stone',
          },
        ]}
      />
      <ColorInput
        onChange={(v) => setConfig('accent_color', v as Config['accent_color'])}
        value={config.accent_color}
        label="Accent Color"
        colors={[
          {
            bgClass: 'bg-red-500',
            name: 'Red',
          },
          {
            bgClass: 'bg-orange-500',
            name: 'Orange',
          },
          {
            bgClass: 'bg-amber-500',
            name: 'Amber',
          },
          {
            bgClass: 'bg-yellow-500',
            name: 'Yellow',
          },
          {
            bgClass: 'bg-lime-500',
            name: 'Lime',
          },
          {
            bgClass: 'bg-green-500',
            name: 'Green',
          },
          {
            bgClass: 'bg-emerald-500',
            name: 'Emerald',
          },
          {
            bgClass: 'bg-teal-500',
            name: 'Teal',
          },
          {
            bgClass: 'bg-cyan-500',
            name: 'Cyan',
          },
          {
            bgClass: 'bg-sky-500',
            name: 'Sky',
          },
          {
            bgClass: 'bg-blue-500',
            name: 'Blue',
          },
          {
            bgClass: 'bg-indigo-500',
            name: 'Indigo',
          },
          {
            bgClass: 'bg-violet-500',
            name: 'Violet',
          },
          {
            bgClass: 'bg-purple-500',
            name: 'Purple',
          },
          {
            bgClass: 'bg-fuchsia-500',
            name: 'Fuchsia',
          },
          {
            bgClass: 'bg-pink-500',
            name: 'Pink',
          },
          {
            bgClass: 'bg-rose-500',
            name: 'Rose',
          },
        ]}
      />
      <div
        style={generateCssVariables(
          config.main_color,
          config.accent_color,
          config.dark_mode
        )}
      >
        <div class="my-4 rounded-lg border-2 border-accent-600 bg-primary-950 px-4 py-2 text-primary-100">
          <p class="my-4 text-lg font-semibold">Appearance Preview</p>
          <SongButton
            artist="Rick Astley"
            coverArt={null}
            title="Never Gonna Give You Up"
            duration={212}
          />
        </div>
      </div>
      <div class="flex justify-end">
        <Button
          variant="accent"
          class="px-8"
          onClick={() =>
            setGlobalConfig({
              ...config,
            }).then(goBack)
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Settings;
