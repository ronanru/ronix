import { convertFileSrc } from '@tauri-apps/api/tauri';
import { cx } from 'class-variance-authority';
import { MusicIcon } from 'lucide-solid';
import { Show, type Component } from 'solid-js';

const CoverArt: Component<{
  src: string | null;
  class?: string;
}> = (props) => {
  return (
    <Show
      when={props.src}
      fallback={
        <div
          class={cx(
            'grid aspect-square h-full place-items-center bg-accent-900 text-accent-100 transition-colors',
            props.class,
          )}
        >
          <MusicIcon />
        </div>
      }
    >
      <img
        src={convertFileSrc(props.src as string)}
        alt=""
        class={props.class}
      />
    </Show>
  );
};

export default CoverArt;
