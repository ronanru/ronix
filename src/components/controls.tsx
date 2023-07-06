import { library } from '@/library';
import {
  nextSong,
  previousSong,
  seek,
  state,
  togglePause,
  updateCurrentSong,
} from '@/state';
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
  let animationFrame: number;
  let isUpdateRequestSent = false;

  const [currentTime, setCurrentTime] = createSignal(0);
  const [currentSongDuration, setCurrentSongDuration] = createSignal(Infinity);

  const currentSong = () => library()?.songs[state.currentSong!]!;
  const currentAlbum = () => library()?.albums[currentSong()?.album!]!;
  const currentArtist = () => library()?.artists[currentAlbum()?.artist!]!;

  let update = () => {
    if (!state.pausedAt) {
      const newCurrentTime = Date.now() - state.songStartedAt;
      if (newCurrentTime < currentSongDuration()) {
        setCurrentTime(newCurrentTime);
      } else if (!isUpdateRequestSent) {
        isUpdateRequestSent = true;
        setTimeout(() => {
          updateCurrentSong().then(() => {
            isUpdateRequestSent = false;
          });
        }, 250);
      }
    }
    animationFrame = requestAnimationFrame(update);
  };

  createEffect(
    on(currentSong, () =>
      setCurrentSongDuration(currentSong()?.duration || Infinity)
    )
  );

  createEffect(
    on(
      () => state.pausedAt,
      () => {
        if (state.pausedAt) cancelAnimationFrame(animationFrame);
        else update();
      }
    )
  );

  const onSeek = (event: MouseEvent) => {
    const seekTo = Math.round(
      (event.clientX / window.innerWidth) * currentSongDuration()
    );
    setCurrentTime(seekTo);
    seek(seekTo);
  };

  const currentMinutes = () => Math.floor(currentTime() / 60000);
  const currentSeconds = () =>
    (Math.floor(currentTime() / 1000) % 60).toString().padStart(2, '0');
  const durationMinutes = () => Math.floor(currentSongDuration() / 60000);
  const durationSeconds = () =>
    (Math.floor(currentSongDuration() / 1000) % 60).toString().padStart(2, '0');

  onMount(update);
  onCleanup(() => cancelAnimationFrame(animationFrame));

  return (
    <Show when={state.currentSong}>
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
            {state.pausedAt ? (
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
