import { api } from '@/api';
import { refetchLibrary } from '@/library';
import { navigate } from '@/router';
import {
  FolderIcon,
  MenuIcon,
  PlusIcon,
  RefreshCcwIcon,
  SettingsIcon,
} from 'lucide-solid';
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  type Component,
} from 'solid-js';
import { Transition } from 'solid-transition-group';
import Button from './ui/button';

const Menu: Component<{
  onOpenDownloadModal: () => void;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [hoveredItem, setHoveredItem] = createSignal(0);

  let container: HTMLDivElement;
  let menu: HTMLDivElement;

  const menuItems = () => [
    {
      name: 'Settings',
      icon: SettingsIcon,
      onClick: () => navigate({ name: 'settings' }),
      id: 'settings',
    },
    {
      icon: PlusIcon,
      name: 'Download song',
      onClick: () => {
        props.onOpenDownloadModal();
        closeMenu();
      },
      id: 'downloadSong',
    },
    {
      icon: RefreshCcwIcon,
      name: 'Refresh library',
      onClick: () => api.mutation(['library.refresh']).then(refetchLibrary),
      id: 'refreshLibrary',
    },
    {
      icon: FolderIcon,
      name: 'Library Manager',
      onClick: () => navigate({ name: 'library Manager' }),
      id: 'libraryManager',
    },
  ];

  const onWindowClick = (e: MouseEvent) => {
    isOpen() && !container.contains(e.target as Node) && closeMenu();
  };

  window.addEventListener('click', onWindowClick);
  onCleanup(() => window.removeEventListener('click', onWindowClick));

  createEffect(() => isOpen() && menu.focus());

  const closeMenu = () => {
    setIsOpen(false);
    setHoveredItem(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowDown':
      case 'j':
        setHoveredItem((hoveredItem() + 1) % menuItems().length);
        break;
      case 'ArrowUp':
      case 'k':
        setHoveredItem(
          (hoveredItem() - 1 + menuItems().length) % menuItems().length,
        );
        break;
      case 'Enter':
      case 'Space':
        menuItems()[hoveredItem()].onClick();
        break;
      case 'Escape':
        closeMenu();
        break;
      case 'Home':
        setHoveredItem(0);
        break;
      case 'End':
        setHoveredItem(menuItems().length - 1);
        break;
    }
  };

  return (
    <div class="relative" ref={container!}>
      <Button
        aria-haspopup="menu"
        aria-expanded={isOpen()}
        role="link"
        size="icon"
        aria-controls="globalMenu"
        aria-label="Navigation menu"
        id="globalMenuButton"
        onClick={() => {
          setIsOpen(!isOpen());
          setHoveredItem(0);
        }}
      >
        <MenuIcon />
      </Button>
      <Transition
        enterClass="scale-0"
        enterToClass="scale-100 transition-transform origin-top-right"
        exitClass="scale-100"
        exitToClass="scale-0 transition-transform origin-top-right"
      >
        <Show when={isOpen()}>
          <div
            role="menu"
            class="absolute right-0 top-12 flex w-56 flex-col gap-2 rounded-xl bg-primary-900 p-2"
            id="globalMenu"
            tabIndex={0}
            ref={menu!}
            onKeyDown={onKeyDown}
            aria-labelledby="globalMenuButton"
            aria-activedescendant={menuItems()[hoveredItem()]?.id}
          >
            <For each={menuItems()}>
              {({ name, icon: Icon, onClick, id }, i) => (
                <Button
                  variant="ghost"
                  role="menuitem"
                  id={id}
                  tabIndex={-1}
                  onMouseOver={() => setHoveredItem(i())}
                  onClick={onClick}
                  class={
                    hoveredItem() === i()
                      ? 'bg-primary-800 hover:!bg-primary-800'
                      : ''
                  }
                >
                  <Icon />
                  {name}
                </Button>
              )}
            </For>
          </div>
        </Show>
      </Transition>
    </div>
  );
};

export default Menu;
