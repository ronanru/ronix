import { api } from '@/api';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { library, refetchLibrary } from '@/library';
import SongButton from '@/songButton';
import { For, Show, createSignal, type Component } from 'solid-js';

const SongList: Component<{
  albums?: string[];
  album?: string;
  ids?: string[];
  noSort?: boolean;
  isManager?: boolean;
}> = (props) => {
  const [songToDelete, setSongToDelete] = createSignal<string | null>(null);

  const [isLoading, setIsLoading] = createSignal(false);
  const [returnText, setReturnText] = createSignal<string | null>(null);

  const songs = () => {
    let entries = Object.entries(library()?.songs || {});
    if (props.albums)
      entries = entries.filter(([, song]) =>
        props.albums!.includes(song.album),
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
    <>
      <Modal
        isOpen={!!props.isManager && !!songToDelete()}
        onClose={() => setSongToDelete(null) !== null}
        title={
          returnText() ??
          (isLoading()
            ? 'Deleting...'
            : `Do you really want to delete "${library()?.songs[songToDelete()!]
                .title}"?`)
        }
        disableClosing={!returnText()}
      >
        <Show when={!returnText() && !isLoading()}>
          <div class="flex justify-end gap-2">
            <Button
              variant="danger"
              onClick={() => {
                setIsLoading(true);
                api
                  .mutation(['library.deleteSong', songToDelete()!])
                  .then((text) => {
                    setReturnText(text);
                    refetchLibrary();
                  });
              }}
            >
              Yes
            </Button>
            <Button onClick={() => setSongToDelete(null)}>No</Button>
          </div>
        </Show>
      </Modal>
      <div class="flex flex-col overflow-x-hidden">
        <For
          each={songs()}
          fallback={<p class="text-center">No songs found</p>}
        >
          {(song) => (
            <SongButton
              {...song}
              noArtist={!!props.albums || !!props.album}
              noCoverArt={!!props.album}
              coverArt={song.cover_art}
              isManager={props.isManager}
              onDelete={() => {
                setSongToDelete(song.id);
                setIsLoading(false);
              }}
              onClick={() =>
                !props.isManager &&
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
    </>
  );
};

export default SongList;
