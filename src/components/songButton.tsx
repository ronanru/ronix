import type { FullSong } from '@/library';
import { playSong } from '@/state';
import { type Component } from 'solid-js';
import CoverArt from './coverArt';

const SongButton: Component<FullSong> = (props) => {
  return (
    <button
      onClick={() => playSong(props.id)}
      class="grid w-full grid-cols-[3rem,1fr,2rem] items-center gap-4 rounded-xl p-4 transition-colors hover:bg-primary-900"
    >
      <CoverArt src={props.cover_art} class="h-12 w-12 rounded-lg" />
      <div class="flex-1">
        <p class="truncate text-left font-bold">{props.title}</p>
        <p class="truncate text-left">{props.artist}</p>
      </div>
      <p>
        {Math.floor(props.duration / 60000)}:
        {(Math.floor(props.duration / 1000) % 60).toString().padStart(2, '0')}
      </p>
    </button>
  );
};

export default SongButton;
