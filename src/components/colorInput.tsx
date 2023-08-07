import { For, createUniqueId, type Component } from 'solid-js';
import Button from './ui/button';

type Color = {
  bgClass: string;
  name: string;
};

const ColorInput: Component<{
  colors: Color[];
  value: string;
  label: string;
  onChange: (value: string) => void;
}> = (props) => {
  const id = createUniqueId();

  const onRadioGroupKeyDown = (e: KeyboardEvent) => {
    const upButtons = ['ArrowLeft', 'h', 'ArrowUp', 'k'];
    const downButtons = ['ArrowRight', 'l', 'ArrowDown', 'j'];
    if (!upButtons.includes(e.key) && !downButtons.includes(e.key)) return;
    const index = props.colors.findIndex((c) => c.name === props.value);
    const newIndex = index + (upButtons.includes(e.key) ? -1 : 1);
    props.onChange(
      (props.colors.at(newIndex % props.colors.length) as Color).name,
    );
  };

  return (
    <div class="mt-8">
      <p class="my-4 text-xl font-semibold" id={id}>
        {props.label}
      </p>
      <div
        class="flex gap-2 overflow-y-visible overflow-x-scroll"
        role="radiogroup"
        aria-labelledby={id}
      >
        <For each={props.colors}>
          {(color) => (
            <Button
              class="w-20 flex-shrink-0 focus:outline-none"
              onClick={() => props.onChange(color.name)}
              variant={color.name === props.value ? 'default' : 'ghost'}
              role="radio"
              tabIndex={color.name === props.value ? 0 : -1}
              onKeyDown={onRadioGroupKeyDown}
              aria-checked={color.name === props.value}
              data-value={color.name}
            >
              <div class="flex flex-col items-center gap-2">
                <div class={`h-8 w-8 rounded-full ${color.bgClass}`} />
                <p class="text-sm">{color.name}</p>
              </div>
            </Button>
          )}
        </For>
      </div>
    </div>
  );
};

export default ColorInput;
