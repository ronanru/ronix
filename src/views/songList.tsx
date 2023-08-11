import { api } from '@/api';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import TextInput from '@/components/ui/textInput';
import { library, refetchLibrary } from '@/library';
import SongButton from '@/songButton';
import {
  For,
  Match,
  Show,
  Switch,
  createSignal,
  type Component,
} from 'solid-js';

const SongList: Component<{
  albums?: string[];
  album?: string;
  ids?: string[];
  noSort?: boolean;
  isManager?: boolean;
}> = (props) => {
  const [songToEdit, setSongToEdit] = createSignal<string | null>(null);
  const [operation, setOperation] = createSignal<'EDIT' | 'DELETE'>('EDIT');

  const songEditData = () => library()?.songs[songToEdit()!];
  const albumEditData = () => library()?.albums[songEditData()!.album!];
  const artistEditData = () => library()?.artists[albumEditData()!.artist!];

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
        isOpen={!!props.isManager && !!songToEdit()}
        onClose={() => setSongToEdit(null) !== null}
        title={
          returnText() ??
          (isLoading()
            ? {
                DELETE: 'Deleting...',
                EDIT: 'Editing...',
              }[operation()]
            : `${
                {
                  DELETE: 'Do you really want to delete',
                  EDIT: 'Edit',
                }[operation()]
              } "${library()?.songs[songToEdit()!].title}"?`)
        }
        disableClosing={!returnText()}
      >
        <Show when={!returnText() && !isLoading()}>
          <Switch>
            <Match when={operation() === 'DELETE'}>
              <div class="flex justify-end gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsLoading(true);
                    api
                      .mutation(['library.deleteSong', songToEdit()!])
                      .then((text) => {
                        setReturnText(text);
                        refetchLibrary();
                      });
                  }}
                >
                  Yes
                </Button>
                <Button onClick={() => setSongToEdit(null)}>No</Button>
              </div>
            </Match>
            <Match when={operation() === 'EDIT'}>
              <form
                class="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  const formData = new FormData(e.currentTarget);
                  api
                    .mutation([
                      'library.editSong',
                      {
                        album: formData.get('album') as string,
                        title: formData.get('title') as string,
                        artist: formData.get('artist') as string,
                        id: songToEdit()!,
                      },
                    ])
                    .then((text) => {
                      setReturnText(text);
                      refetchLibrary();
                    });
                }}
              >
                <TextInput
                  name="title"
                  label="Title"
                  value={songEditData()?.title}
                />
                <TextInput
                  name="album"
                  label="Album"
                  value={albumEditData()?.name}
                />
                <TextInput
                  name="artist"
                  label="Artist"
                  value={artistEditData()?.name}
                />
                <div class="flex justify-end gap-2">
                  <Button onClick={() => setSongToEdit(null)}>Cancel</Button>
                  <Button variant="accent" type="submit">
                    Edit
                  </Button>
                </div>
              </form>
            </Match>
          </Switch>
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
                setSongToEdit(song.id);
                setOperation('DELETE');
                setIsLoading(false);
              }}
              onEdit={() => {
                setSongToEdit(song.id);
                setOperation('EDIT');
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
