import { createResource } from 'solid-js';
import { api } from './api';
import { Config } from './gen/tauri-types';
import { refetchLibrary } from './library';

const [config, { mutate }] = createResource<Config>(() =>
  api.query(['config.get'])
);

const setConfig = async (newConfig: Config) => {
  await api.mutation(['config.set', newConfig]);
  if (newConfig.music_folders !== config()?.music_folders) {
    await refetchLibrary();
  }
  mutate(newConfig);
};

export { config, setConfig };
