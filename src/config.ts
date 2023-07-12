import { createResource, type JSX } from 'solid-js';
import colors from 'tailwindcss/colors';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';
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

const tailwindColors = [
  950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50,
] as const;

type TailwindColor = (typeof tailwindColors)[number];

const getColorNumber = (color: number, darkMode: boolean) => {
  return tailwindColors.at(
    color * (darkMode ? 1 : -1) - (darkMode ? 0 : 1)
  ) as TailwindColor;
};

export const generateCssVariables = (
  mainColor: string,
  accentColor: string,
  darkMode: boolean
): JSX.CSSProperties => {
  const styles: JSX.CSSProperties = {
    '--color-white': darkMode ? '#ffffff' : '#000000',
    'color-scheme': darkMode ? 'dark' : 'light',
  };
  for (let i = 0; i < tailwindColors.length; i++) {
    styles[`--color-primary-${tailwindColors[i]}`] =
      colors[mainColor.toLowerCase() as keyof DefaultColors][
        getColorNumber(i, darkMode)
      ];
    styles[`--color-accent-${tailwindColors[i]}`] =
      colors[accentColor.toLowerCase() as keyof DefaultColors][
        getColorNumber(i, darkMode)
      ];
  }
  return styles;
};

export { config, setConfig };
