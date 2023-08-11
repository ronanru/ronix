import { PencilIcon, Trash2Icon } from 'lucide-solid';
import { Show, type Component } from 'solid-js';
import CoverArt from './components/coverArt';
import Button from './components/ui/button';

const SongButton: Component<{
  title: string;
  artist: string;
  coverArt: string | null;
  duration: number;
  noArtist?: boolean;
  noCoverArt?: boolean;
  onClick?: (e: MouseEvent) => void;
  isManager?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}> = (props) => {
  return (
    <button
      onClick={(e) => props.onClick?.(e)}
      class="flex w-full max-w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-primary-900"
    >
      <Show when={!props.noCoverArt}>
        <CoverArt
          src={props.coverArt}
          class="h-12 w-12 flex-shrink-0 rounded-lg"
        />
      </Show>
      <div class="flex-shrink flex-grow overflow-hidden text-left">
        <p class="truncate font-bold">{props.title}</p>
        <Show when={!props.noArtist}>
          <button class="block truncate">{props.artist}</button>
        </Show>
      </div>
      <Show
        when={props.isManager}
        fallback={
          <p class="flex-shrink-0">
            {Math.floor(props.duration / 60)}:
            {(props.duration % 60).toString().padStart(2, '0')}
          </p>
        }
      >
        <Button variant="accent" size="icon" onClick={props.onEdit}>
          <PencilIcon />
        </Button>
        <Button variant="danger" size="icon" onClick={props.onDelete}>
          <Trash2Icon />
        </Button>
      </Show>
    </button>
  );
};

export default SongButton;
