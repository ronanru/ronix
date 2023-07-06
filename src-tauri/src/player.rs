use crate::{
  get_current_time,
  library::{get_automatic_next_songs, Library},
  Context, PlayerScope, PlayerState, RepeatMode,
};
use gst::ClockTime;
use gst_player::Player;
use rspc::{Router, RouterBuilder, Type};
use serde::{Deserialize, Serialize};

#[derive(Type, Deserialize)]
struct PlaySongInput {
  song_id: String,
  scope: PlayerScope,
}

#[derive(Type, Serialize)]
struct CurrentSongData {
  song_id: Option<String>,
  started_at: u32,
}

pub fn next_song(state: &mut PlayerState, library: &Library, player: &Player) -> Option<String> {
  if let Some(current_song) = state.current_song.clone() {
    let next_song = state.next_songs.pop().or_else(|| {
      state
        .automatic_next_songs
        .pop()
        .or_else(|| match state.repeat_mode {
          RepeatMode::All => state.automatic_next_songs.pop().or_else(|| {
            let mut next_songs =
              get_automatic_next_songs(&library, &current_song, state.is_shuffled, &state.scope);
            let next_song = next_songs.pop();
            state.automatic_next_songs = next_songs;
            next_song
          }),
          RepeatMode::One => Some(current_song.clone()),
          RepeatMode::None => None,
        })
    });
    state.previous_songs.push(current_song.clone());
    if let Some(song_id) = &next_song {
      player.set_uri(Some(&format!(
        "file://{}",
        library.songs.get(song_id).unwrap().path.to_str().unwrap()
      )));
      player.play();
    }
    state.song_started_at = get_current_time();
    state.current_song = next_song.clone();
    return next_song;
  }
  None
}

pub fn get_router() -> RouterBuilder<Context> {
  Router::<Context>::new()
    .mutation("playSong", |t| {
      t(|ctx, input: PlaySongInput| {
        let library = ctx.library.lock().unwrap();
        let mut state = ctx.player_state.lock().unwrap();
        let song = library.songs.get(&input.song_id).unwrap();
        state.automatic_next_songs =
          get_automatic_next_songs(&library, &input.song_id, state.is_shuffled, &input.scope);
        state.current_song = Some(input.song_id);
        state.scope = input.scope;
        state.song_started_at = get_current_time();
        ctx
          .player
          .set_uri(Some(&format!("file://{}", song.path.to_str().unwrap())));
        ctx.player.play();
      })
    })
    .mutation("setPause", |t| {
      t(|ctx, input: bool| {
        if input {
          ctx.player.pause();
        } else {
          ctx.player.play();
        }
      })
    })
    .mutation("seek", |t| {
      t(|ctx, input: u32| {
        ctx.player.seek(ClockTime::from_mseconds(input as u64));
      })
    })
    .mutation("previousSong", |t| {
      t(|ctx, _: ()| {
        let mut state = ctx.player_state.lock().unwrap();
        if let Some(song_id) = state.previous_songs.pop() {
          if let Some(song_id) = state.current_song.clone() {
            state.automatic_next_songs.push(song_id);
          }
          let library = ctx.library.lock().unwrap();
          let song = library.songs.get(&song_id).unwrap();
          state.current_song = Some(song_id);
          state.song_started_at = get_current_time();
          ctx
            .player
            .set_uri(Some(&format!("file://{}", song.path.to_str().unwrap())));
          ctx.player.play();
          state.current_song.clone()
        } else {
          ctx.player.stop();
          state.current_song = None;
          None
        }
      })
    })
    .mutation("nextSong", |t| {
      t(|ctx, _: ()| {
        let mut state = ctx.player_state.lock().unwrap();
        next_song(&mut state, &ctx.library.lock().unwrap(), &ctx.player)
      })
    })
    .query("getCurrentSongData", |t| {
      t(|ctx, _: ()| {
        let state = ctx.player_state.lock().unwrap();
        CurrentSongData {
          song_id: state.current_song.clone(),
          started_at: state.song_started_at,
        }
      })
    })
}
