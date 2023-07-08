import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, splitProps, type Component, type JSX } from 'solid-js';

const buttonVariants = cva(
  'transition-colors flex justify-center items-center',
  {
    variants: {
      variant: {
        default: 'bg-primary-800 hover:bg-primary-700',
        light: 'bg-primary-700 hover:bg-primary-600',
        accent: 'bg-accent-600 hover:bg-accent-700',
        ghost: 'hover:bg-primary-900',
      },
      size: {
        small: 'text-sm px-2 py-1 rounded-md font-medium gap-2',
        default: 'px-4 py-2 rounded-lg font-semibold gap-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button: Component<
  {
    children?: JSX.Element | JSX.Element[] | string;
  } & ComponentProps<'button'> &
    VariantProps<typeof buttonVariants>
> = (props) => {
  const [local, btnProps] = splitProps(props, [
    'children',
    'size',
    'variant',
    'class',
  ]);

  return (
    <button
      {...btnProps}
      class={buttonVariants({
        size: local.size,
        variant: local.variant,
        class: local.class,
      })}
    >
      {local.children}
    </button>
  );
};

export default Button;
