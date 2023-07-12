import { api } from '@/api';
import { CurrentSongData, RepeatMode } from '@/gen/tauri-types';
import { library } from '@/library';
import {
  PauseIcon,
  PlayIcon,
  Repeat1Icon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-solid';
import {
  Match,
  Show,
  Switch,
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
    volume: 0.5,
  });

  let animationFrame: number | null = null;

  const [currentTime, setCurrentTime] = createSignal(0);

  const [repeatMode, setRepeatMode] = createSignal<RepeatMode>('None');
  const [isShuffled, setIsShuffled] = createSignal(false);

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const currentSong = () => library()?.songs[currentSongData()?.current_song!]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const currentAlbum = () => library()?.albums[currentSong()?.album!]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.addSubscription(['player.currentSong'] as any, {
      onData: setCurrentSongData,
    });
    update();
  });

  onCleanup(() => animationFrame && cancelAnimationFrame(animationFrame));

  const onSeek = (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
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

  const toggleShuffle = () =>
    api.mutation(['player.toggleShuffle']).then(setIsShuffled);

  const toggleRepeatMode = () =>
    api.mutation(['player.toggleRepeatMode']).then(setRepeatMode);

  const setVolume = (volume: number) =>
    api.mutation(['player.setVolume', volume]);

  const onSliderKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'l':
      case 'j':
        api.mutation([
          'player.seek',
          Math.max(0, Math.floor(currentTime() / 1000) - 5),
        ]);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
      case 'h':
      case 'k':
        api.mutation([
          'player.seek',
          Math.min(currentSongDuration(), Math.floor(currentTime() / 1000) + 5),
        ]);
        break;
      case 'Home':
        api.mutation(['player.seek', 0]);
        break;
      case 'End':
        nextSong();
        break;
      case 'PageUp':
        api.mutation([
          'player.seek',
          Math.max(0, Math.floor(currentTime() / 1000) - 30),
        ]);
        break;
      case 'PageDown':
        api.mutation([
          'player.seek',
          Math.min(
            currentSongDuration(),
            Math.floor(currentTime() / 1000) + 30
          ),
        ]);
        break;
    }
  };

  return (
    <Show when={currentSongData().current_song}>
      <section aria-label="Player controls" class="w-full">
        <button
          onKeyDown={onSliderKeyDown}
          role="slider"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuenow={currentTime()}
          aria-valuemax={currentSongDuration()}
          aria-label="Seek slider"
          aria-valuetext={`${currentMinutes()} minutes and ${currentSeconds()} seconds out of ${durationMinutes()} minutes and ${durationSeconds()} seconds`}
          class="block h-2 w-full cursor-pointer bg-primary-800"
          onClick={onSeek}
        >
          <div
            style={{
              width: `${(currentTime() / currentSongDuration()) * 100}%`,
            }}
            class="h-2 bg-accent-600 transition-[width] duration-75"
          />
        </button>
        <div class="grid grid-cols-[1fr,10.5rem,1fr] items-center gap-4 p-4">
          <div class="flex gap-4 overflow-hidden">
            <CoverArt
              src={currentAlbum().cover_art}
              class="h-14 w-14 rounded-xl"
            />
            <div class="overflow-hidden">
              <p class="truncate font-bold">{currentSong().title}</p>
              <p class="truncate">{currentArtist().name}</p>
            </div>
          </div>
          <div class="flex">
            <Button
              class="rounded-r-none"
              onClick={previousSong}
              aria-label="Previous Song"
            >
              <SkipBackIcon />
            </Button>
            <Button
              variant="light"
              class="rounded-none"
              onClick={togglePause}
              aria-label={currentSongData().paused_at ? 'Play' : 'Pause'}
            >
              <Show
                when={currentSongData().paused_at}
                fallback={<PauseIcon fill="currentColor" />}
              >
                <PlayIcon fill="currentColor" />
              </Show>
            </Button>
            <Button
              class="rounded-l-none"
              onClick={nextSong}
              aria-label="Next Song"
            >
              <SkipForwardIcon />
            </Button>
          </div>
          <div>
            <p class="relative -top-2 text-right text-sm">
              {currentMinutes()}:{currentSeconds()} / {durationMinutes()}:
              {durationSeconds()}
            </p>
            <div class="flex justify-end gap-2">
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="small"
                  aria-label="Toggle Mute"
                  aria-pressed={currentSongData().volume === 0}
                  onClick={() =>
                    setVolume(currentSongData().volume === 0 ? 0.5 : 0)
                  }
                >
                  <Switch>
                    <Match when={currentSongData().volume > 0.5}>
                      <Volume2Icon size={16} />
                    </Match>
                    <Match when={currentSongData().volume > 0}>
                      <Volume1Icon size={16} />
                    </Match>
                    <Match when={currentSongData().volume === 0}>
                      <VolumeXIcon size={16} />
                    </Match>
                  </Switch>
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={currentSongData().volume}
                  onInput={(e) => setVolume(parseFloat(e.currentTarget.value))}
                />
              </div>
              <Button
                variant={isShuffled() ? 'default' : 'ghost'}
                size="small"
                onClick={toggleShuffle}
                aria-pressed={isShuffled()}
                aria-label="Toggle Shuffle"
              >
                <ShuffleIcon size={16} />
              </Button>
              <Button
                variant={repeatMode() !== 'None' ? 'default' : 'ghost'}
                size="small"
                aria-label={`Toggle Repeat: repeat ${repeatMode()}`}
                aria-pressed={repeatMode() !== 'None'}
                onClick={toggleRepeatMode}
              >
                <Show
                  when={repeatMode() === 'One'}
                  fallback={<RepeatIcon size={16} />}
                >
                  <Repeat1Icon size={16} />
                </Show>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Show>
  );
};

export default Controls;
