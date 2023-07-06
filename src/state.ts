import { createStore } from 'solid-js/store';
import { api } from './api';

const [state, setState] = createStore<{
  currentSong: string | null;
  pausedAt: number | null;
  songStartedAt: number;
}>({
  currentSong: null,
  pausedAt: null,
  songStartedAt: 0,
});

export const playSong = (song: string) => {
  setState({
    currentSong: song,
    pausedAt: null,
    songStartedAt: Date.now(),
  });
  api.mutation([
    'player.playSong',
    {
      scope: 'Library',
      song_id: song,
    },
  ]);
};

export const togglePause = () => {
  setState(({ pausedAt, songStartedAt }) => {
    api.mutation(['player.setPause', pausedAt === null]);
    return pausedAt
      ? {
          pausedAt: null,
          songStartedAt: Date.now() - pausedAt + songStartedAt,
        }
      : {
          pausedAt: Date.now(),
        };
  });
};

export const updateCurrentSong = async () => {
  let data = await api.query(['player.getCurrentSongData']);
  setState({
    currentSong: data.song_id,
    songStartedAt: data.started_at,
    pausedAt: null,
  });
};

export const seek = (time: number) => {
  setState(({ songStartedAt, pausedAt }) => {
    api.mutation(['player.seek', time]);
    return pausedAt
      ? {
          pausedAt: songStartedAt + time,
        }
      : {
          songStartedAt: Date.now() - time,
        };
  });
};

export const previousSong = async () => {
  if (Date.now() - state.songStartedAt > 5000) return seek(0);
  let currentSong = await api.mutation(['player.previousSong']);
  if (!currentSong) return seek(0);
  setState({
    songStartedAt: Date.now(),
    currentSong,
  });
};

export const nextSong = async () => {
  setState({
    songStartedAt: Date.now(),
    currentSong: await api.mutation(['player.nextSong']),
  });
};

export { state };
