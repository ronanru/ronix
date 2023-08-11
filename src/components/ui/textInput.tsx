import {
  ComponentProps,
  createUniqueId,
  splitProps,
  type Component,
} from 'solid-js';

const TextInput: Component<
  {
    label: string;
  } & ComponentProps<'input'>
> = (props) => {
  const id = createUniqueId();

  const [local, otherProps] = splitProps(props, ['label']);

  return (
    <div>
      <label for={id}>{local.label}</label>
      <input
        class="mt-1 block w-full rounded-md bg-primary-800 px-2 py-1"
        type="text"
        id={id}
        {...otherProps}
      />
    </div>
  );
};

export default TextInput;
