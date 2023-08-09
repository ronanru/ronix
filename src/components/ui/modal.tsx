/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { XIcon } from 'lucide-solid';
import { Show, createUniqueId, type Component, type JSX } from 'solid-js';
import { Transition } from 'solid-transition-group';
import Button from './button';

const Modal: Component<{
  isOpen: boolean;
  onClose: () => void;
  children?: JSX.Element | JSX.Element[];
  title: string;
  disableClosing?: boolean;
}> = (props) => {
  const id = createUniqueId();

  return (
    <Transition
      enterClass="opacity-0"
      enterToClass="opacity-100 transition-opacity"
      exitClass="opacity-100"
      exitToClass="opacity-0 transition-opacity"
    >
      <Show when={props.isOpen}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          class="absolute inset-0 z-50 grid place-items-center bg-black bg-opacity-75 p-4 backdrop-blur-sm"
          onKeyDown={(e) =>
            e.key === 'Escape' && !props.disableClosing && props.onClose()
          }
        >
          <section class="w-full max-w-md space-y-4 rounded-xl bg-primary-900 p-6 backdrop:backdrop-blur">
            <div class="flex justify-between">
              <h1 class="text-xl font-bold" id={`${id}-title`}>
                {props.title}
              </h1>
              <Show when={!props.disableClosing}>
                <Button
                  onClick={props.onClose}
                  variant="ghost"
                  size="icon"
                  class="relative -right-2 -top-2 p-1"
                >
                  <XIcon />
                </Button>
              </Show>
            </div>
            {props.children}
          </section>
        </div>
      </Show>
    </Transition>
  );
};

export default Modal;
