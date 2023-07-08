import { library } from '@/library';
import { type Component } from 'solid-js';
import AlbumList from './albumList';
import SongList from './songList';

const ArtistPage: Component<{ artistId: string }> = (props) => {
  const artist = () => library()?.artists[props.artistId];
  const albums = () =>
    Object.entries(library()?.albums || {})
      .filter(([, album]) => album.artist === props.artistId)
      .map(([id]) => id);
  const songs = () =>
    Object.entries(library()?.songs || {})
      .filter(([, song]) => albums().includes(song.album))
      .map(([id]) => id);

  return (
    <div>
      <h1 class="mt-16 text-5xl font-bold">{artist()?.name}</h1>
      <section aria-label="Albums" class="mt-8">
        <h2 class="mb-4 text-2xl font-bold">Albums</h2>
        <AlbumList albums={albums()} isOnArtistPage />
      </section>
      <section aria-label="Songs" class="mt-8">
        <h2 class="mb-4 text-2xl font-bold">Songs</h2>
        <SongList songs={songs()} isOnArtistPage />
      </section>
    </div>
  );
};

export default ArtistPage;
