import { cx } from 'class-variance-authority';
import { Music } from 'lucide-solid';
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
            'grid place-items-center bg-primary-800 transition-colors',
            props.class
          )}
        >
          <Music />
        </div>
      }
    >
      <img src={props.src as string} alt="" class={props.class} />
    </Show>
  );
};

export default CoverArt;
