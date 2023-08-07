import { api } from '@/api';
import Button from '@/components/ui/button';
import { library, refetchLibrary } from '@/library';
import SongButton from '@/songButton';
import { XIcon } from 'lucide-solid';
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
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
  const [songToDelete, setSongToDelete] = createSignal<string | null>(null);
  let dialog: HTMLDialogElement;

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

  createEffect(() => songToDelete() && props.isManager && dialog.showModal());

  return (
    <>
      <Show when={props.isManager && songToDelete()}>
        <dialog
          ref={dialog!}
          class="w-full max-w-md space-y-4 rounded-xl bg-primary-900 p-6 backdrop:backdrop-blur"
        >
          <Switch fallback={<h1 class="text-xl font-bold">Deleting...</h1>}>
            <Match when={returnText()}>
              <div class="flex justify-between">
                <h1 class="text-xl font-bold">{returnText()}</h1>
                <Button
                  onClick={() => setSongToDelete(null)}
                  variant="ghost"
                  size="icon"
                  class="relative -right-2 -top-2 p-1"
                >
                  <XIcon />
                </Button>
              </div>
            </Match>
            <Match when={!isLoading()}>
              <p>
                Do you really want to delete "
                {library()?.songs[songToDelete()!].title}"?
              </p>
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
            </Match>
          </Switch>
        </dialog>
      </Show>
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
