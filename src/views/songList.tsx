import { api } from '@/api';
import { library } from '@/library';
import SongButton from '@/songButton';
import { For, type Component } from 'solid-js';

const SongList: Component<{
  albums?: string[];
  album?: string;
  ids?: string[];
  noSort?: boolean;
}> = (props) => {
  const songs = () => {
    let entries = Object.entries(library()?.songs || {});
    if (props.albums)
      entries = entries.filter(([, song]) =>
        props.albums!.includes(song.album)
      );
    else if (props.album)
      entries = entries.filter(([, song]) => song.album === props.album);
    else if (props.ids)
      entries = entries.filter(([id]) => props.ids!.includes(id));
    let songs = entries.map(([id, song]) => {
      const album = library()!.albums[song.album]!;
      const artist = library()!.artists[album.artist]!;
      return {
        ...song,
        album_id: song.album,
        artist_id: album.artist,
        cover_art: album.cover_art,
        artist: artist.name,
        id,
      };
    });
    if (!props.noSort)
      songs = songs.sort((a, b) => a.title.localeCompare(b.title));
    return songs;
  };

  return (
    <div class="flex flex-col overflow-x-hidden">
      <For each={songs()} fallback={<p class="text-center">No songs found</p>}>
        {(song) => (
          <SongButton
            {...song}
            noArtist={!!props.albums || !!props.album}
            noCoverArt={!!props.album}
            coverArt={song.cover_art}
            onClick={() =>
              api.mutation([
                'player.playSong',
                {
                  scope: props.albums
                    ? {
                        Artist: song.artist_id,
                      }
                    : props.album
                    ? {
                        Album: song.album_id,
                      }
                    : 'Library',
                  song_id: song.id,
                },
              ])
            }
          />
        )}
      </For>
    </div>
  );
};

export default SongList;
