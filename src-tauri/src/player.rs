use crate::{
  get_current_time,
  library::{get_automatic_next_songs, Library},
  Context, PlayerScope, PlayerState, RepeatMode,
};
use async_stream::stream;
use gst::ClockTime;
use gst_player::Player;
use rspc::{Router, RouterBuilder, Type};
use serde::{Deserialize, Serialize};
use souvlaki::{MediaControls, MediaMetadata, MediaPlayback};
use std::{
  sync::{Arc, Mutex},
  time::Duration,
};
use tokio::time::sleep;

#[derive(Type, Deserialize)]
struct PlaySongInput {
  song_id: String,
  scope: PlayerScope,
}

#[derive(Type, Serialize, PartialEq, Clone)]
struct CurrentSongData {
  current_song: Option<String>,
  song_started_at: u32,
  paused_at: Option<u32>,
}

impl From<&Arc<Mutex<PlayerState>>> for CurrentSongData {
  fn from(state: &Arc<Mutex<PlayerState>>) -> Self {
    let state = state.lock().unwrap();
    CurrentSongData {
      current_song: state.current_song.clone(),
      song_started_at: state.song_started_at,
      paused_at: state.paused_at,
    }
  }
}

pub fn next_song(
  mut state: &mut PlayerState,
  library: &Library,
  player: &Player,
  mut os_controls: &mut MediaControls,
) {
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
    state.current_song = None;
    if let Some(song_id) = &next_song {
      play_song(
        song_id,
        &library,
        &player,
        &mut state,
        &mut os_controls,
        true,
      );
    }
  }
}

pub fn toggle_pause(state: &mut PlayerState, player: &Player, os_controls: &mut MediaControls) {
  match state.paused_at {
    Some(paused_at) => {
      player.play();
      state.song_started_at += get_current_time() - paused_at;
      state.paused_at = None;
      os_controls
        .set_playback(MediaPlayback::Playing { progress: None })
        .unwrap();
    }
    None => {
      player.pause();
      state.paused_at = Some(get_current_time());
      os_controls
        .set_playback(MediaPlayback::Paused { progress: None })
        .unwrap();
    }
  }
}

pub fn play_song(
  song_id: &str,
  library: &Library,
  player: &Player,
  state: &mut PlayerState,
  os_controls: &mut MediaControls,
  save_to_prev: bool,
) {
  let song = library.songs.get(song_id).unwrap();
  let album = library.albums.get(&song.album).unwrap();
  let artist = library.artists.get(&album.artist).unwrap();
  player.set_uri(Some(&format!("file://{}", song.path.to_str().unwrap())));
  player.play();
  if let Some(current_song) = &state.current_song {
    if save_to_prev {
      state.previous_songs.push(current_song.clone());
      if (state.previous_songs.len() as u32) > 20 {
        state.previous_songs.remove(0);
      }
    } else {
      state.automatic_next_songs.push(current_song.clone());
    }
  }
  state.current_song = Some(song_id.to_string());
  state.song_started_at = get_current_time();
  state.paused_at = None;
  os_controls
    .set_metadata(MediaMetadata {
      title: Some(&song.title),
      album: Some(&album.name),
      artist: Some(&artist.name),
      cover_url: album.cover_art.as_deref(),
      duration: Some(Duration::from_millis(song.duration as u64)),
    })
    .unwrap();
  os_controls
    .set_playback(MediaPlayback::Playing { progress: None })
    .unwrap();
}

pub fn previous_song(
  state: &mut PlayerState,
  player: &Player,
  library: &Library,
  os_controls: &mut MediaControls,
) {
  if (get_current_time() - state.song_started_at) > 5 {
    return seek(state, player, 0);
  }
  if let Some(song_id) = state.previous_songs.pop() {
    if let Some(song_id) = state.current_song.clone() {
      state.automatic_next_songs.push(song_id);
    }
    play_song(&song_id, library, player, state, os_controls, false);
  } else {
    player.stop();
    state.current_song = None;
  }
}

pub fn seek(state: &mut PlayerState, player: &Player, seek_to: u32) {
  player.seek(ClockTime::from_seconds(seek_to as u64));
  state.song_started_at = get_current_time() - seek_to;
}

pub fn get_router() -> RouterBuilder<Context> {
  Router::<Context>::new()
    .mutation("playSong", |t| {
      t(|ctx, input: PlaySongInput| {
        let library = ctx.library.lock().unwrap();
        let mut state = ctx.player_state.lock().unwrap();
        state.automatic_next_songs =
          get_automatic_next_songs(&library, &input.song_id, state.is_shuffled, &input.scope);
        state.scope = input.scope;
        play_song(
          &input.song_id,
          &library,
          &ctx.player,
          &mut state,
          &mut ctx.os_controls.lock().unwrap(),
          true,
        )
      })
    })
    .mutation("togglePause", |t| {
      t(|ctx, _: ()| {
        toggle_pause(
          &mut ctx.player_state.lock().unwrap(),
          &ctx.player,
          &mut ctx.os_controls.lock().unwrap(),
        );
      })
    })
    .mutation("seek", |t| {
      t(|ctx, input: u32| seek(&mut ctx.player_state.lock().unwrap(), &ctx.player, input))
    })
    .mutation("previousSong", |t| {
      t(|ctx, _: ()| {
        previous_song(
          &mut ctx.player_state.lock().unwrap(),
          &ctx.player,
          &ctx.library.lock().unwrap(),
          &mut ctx.os_controls.lock().unwrap(),
        )
      })
    })
    .mutation("nextSong", |t| {
      t(|ctx, _: ()| {
        next_song(
          &mut ctx.player_state.lock().unwrap(),
          &ctx.library.lock().unwrap(),
          &ctx.player,
          &mut ctx.os_controls.lock().unwrap(),
        )
      })
    })
    .subscription("currentSong", |t| {
      t(|ctx, _: ()| {
        stream! {
          let state = ctx.player_state.clone();
          let mut old_song_data = CurrentSongData::from(&state);
          loop {
            let new_song_data = CurrentSongData::from(&state);
            if new_song_data != old_song_data {
              old_song_data = new_song_data.clone();
              yield new_song_data;
            };
            sleep(Duration::from_millis(100)).await;
          }
        }
      })
    })
}
