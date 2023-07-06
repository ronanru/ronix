import { api } from '@/api';
import { CurrentSongData } from '@/gen/tauri-types';
import { library } from '@/library';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-solid';
import {
  Show,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  type Component,
} from 'solid-js';
import CoverArt from './coverArt';
import Button from './ui/button';

const Controls: Component = () => {
  const [currentSongData, setCurrentSongData] = createSignal<CurrentSongData>({
    current_song: null,
    paused_at: Infinity,
    song_started_at: Infinity,
  });

  let animationFrame: number | null = null;

  const [currentTime, setCurrentTime] = createSignal(0);

  const currentSong = () => library()?.songs[currentSongData()?.current_song!]!;
  const currentAlbum = () => library()?.albums[currentSong()?.album!]!;
  const currentArtist = () => library()?.artists[currentAlbum()?.artist!]!;

  const updateCurrentTime = () =>
    setCurrentTime(
      currentSongData().paused_at
        ? (currentSongData().paused_at! - currentSongData().song_started_at) *
            1000
        : Date.now() - currentSongData().song_started_at * 1000
    );
  const update = () => {
    updateCurrentTime();
    animationFrame = requestAnimationFrame(update);
  };

  const currentSongDuration = () => currentSong()?.duration * 1000;
  const currentMinutes = () => Math.floor(currentTime() / 60000);
  const currentSeconds = () =>
    (Math.floor(currentTime() / 1000) % 60).toString().padStart(2, '0');
  const durationMinutes = () => Math.floor(currentSongDuration() / 60000);
  const durationSeconds = () =>
    (Math.floor(currentSongDuration() / 1000) % 60).toString().padStart(2, '0');

  onMount(() => {
    api.addSubscription(['player.currentSong'] as any, {
      onData: setCurrentSongData,
    });
    update();
  });

  onCleanup(() => animationFrame && cancelAnimationFrame(animationFrame));

  const onSeek = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
    const seekTo = Math.floor(
      (e.clientX / e.currentTarget.clientWidth) * currentSong()!.duration
    );
    api.mutation(['player.seek', seekTo]);
  };
  const togglePause = () => api.mutation(['player.togglePause']);
  const nextSong = () => api.mutation(['player.nextSong']);
  const previousSong = () => api.mutation(['player.previousSong']);

  createEffect(
    on(currentSongData, () => {
      if (!currentSongData().current_song) setCurrentTime(0);
      updateCurrentTime();
      if (currentSongData().paused_at) cancelAnimationFrame(animationFrame!);
      else update();
    })
  );

  return (
    <Show when={currentSongData().current_song}>
      <section aria-label="Player controls" class="relative w-full">
        <div
          role="slider"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuenow={currentTime()}
          aria-valuemax={currentSongDuration()}
          aria-label="Seek slider"
          aria-valuetext={`${currentMinutes()} minutes and ${currentSeconds()} seconds out of ${durationMinutes()} minutes and ${durationSeconds()} seconds`}
          class="h-2 w-full cursor-pointer bg-primary-800"
          onClick={onSeek}
        >
          <div
            style={{
              width: `${(currentTime() / currentSongDuration()) * 100}%`,
            }}
            class="h-2 bg-accent-600 transition-[width] duration-75"
          ></div>
        </div>
        <div class="flex items-center gap-4 p-4">
          <CoverArt
            src={currentAlbum().cover_art}
            class="h-14 w-14 rounded-xl"
          />
          <div>
            <p class="truncate font-bold">{currentSong().title}</p>
            <p class="truncate">{currentArtist().name}</p>
          </div>
          <div class="flex-1"></div>
          <p>
            {currentMinutes()}:{currentSeconds()} / {durationMinutes()}:
            {durationSeconds()}
          </p>
        </div>
        <div class="absolute inset-x-[calc(50vw_-_5.25rem)] inset-y-6 flex">
          <Button class="rounded-r-none" onClick={previousSong}>
            <SkipBack />
          </Button>
          <Button variant="light" class="rounded-none" onClick={togglePause}>
            {currentSongData().paused_at ? (
              <Play fill="currentColor" />
            ) : (
              <Pause fill="currentColor" />
            )}
          </Button>
          <Button class="rounded-l-none" onClick={nextSong}>
            <SkipForward />
          </Button>
        </div>
      </section>
    </Show>
  );
};

export default Controls;
