// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod config;
mod library;
mod player;
use config::{get_config_file, Config};
use gst_player::{Player, PlayerSignalDispatcher, PlayerVideoRenderer};
use library::{read_from_dirs, Library};
use player::{next_song, previous_song, toggle_pause};
use rspc::{Config as RspcConfig, Router, Type};
use serde::Deserialize;
use souvlaki::{MediaControlEvent, MediaControls, PlatformConfig};
use std::{
  sync::{Arc, Mutex},
  time::{SystemTime, UNIX_EPOCH},
};

pub enum RepeatMode {
  None,
  One,
  All,
}

#[derive(Type, Deserialize)]
pub enum PlayerScope {
  Library,
  Album(String),
  Artist(String),
}

#[derive(Clone)]
pub struct Context {
  pub library: Arc<Mutex<Library>>,
  pub config: Arc<Mutex<Config>>,
  pub player: Arc<Player>,
  pub player_state: Arc<Mutex<PlayerState>>,
  pub os_controls: Arc<Mutex<MediaControls>>,
}

pub struct PlayerState {
  pub current_song: Option<String>,
  pub previous_songs: Vec<String>,
  pub next_songs: Vec<String>,
  pub automatic_next_songs: Vec<String>,
  pub repeat_mode: RepeatMode,
  pub is_shuffled: bool,
  pub scope: PlayerScope,
  pub song_started_at: u32,
  pub paused_at: Option<u32>,
}

impl Default for PlayerState {
  fn default() -> Self {
    PlayerState {
      current_song: None,
      previous_songs: Vec::new(),
      next_songs: Vec::new(),
      automatic_next_songs: Vec::new(),
      repeat_mode: RepeatMode::None,
      is_shuffled: false,
      scope: PlayerScope::Library,
      song_started_at: get_current_time(),
      paused_at: Some(get_current_time()),
    }
  }
}

pub fn get_current_time() -> u32 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs() as u32
}

#[tokio::main]
async fn main() {
  gst::init().unwrap();

  let router = Router::<Context>::new()
    .query("getLibrary", |t| {
      t(|ctx, _input: ()| ctx.library.lock().unwrap().clone())
    })
    .merge("config.", config::get_router())
    .merge("player.", player::get_router())
    .config(RspcConfig::new().export_ts_bindings("../src/gen/tauri-types.ts"))
    .build();

  let config: Config = serde_json::from_reader(&get_config_file()).unwrap_or_default();
  let library = Arc::new(Mutex::new(read_from_dirs(&config.music_folders)));
  let player = Arc::new(Player::new(
    None::<PlayerVideoRenderer>,
    None::<PlayerSignalDispatcher>,
  ));

  let player_state = Arc::new(Mutex::new(PlayerState::default()));

  let os_controls = Arc::new(Mutex::new(
    MediaControls::new(PlatformConfig {
      dbus_name: "dev.ronanru.ronix",
      display_name: "Ronix",
      hwnd: None,
    })
    .unwrap(),
  ));

  let player_state_clone = player_state.clone();
  let player_clone = player.clone();
  let library_clone = library.clone();
  let os_controls_clone = os_controls.clone();
  os_controls
    .lock()
    .unwrap()
    .attach(move |event: MediaControlEvent| match event {
      MediaControlEvent::Toggle => toggle_pause(
        &mut player_state_clone.lock().unwrap(),
        &player_clone,
        &mut os_controls_clone.lock().unwrap(),
      ),
      MediaControlEvent::Next => next_song(
        &mut player_state_clone.lock().unwrap(),
        &library_clone.lock().unwrap(),
        &player_clone,
        &mut os_controls_clone.lock().unwrap(),
      ),
      MediaControlEvent::Previous => previous_song(
        &mut player_state_clone.lock().unwrap(),
        &player_clone,
        &library_clone.lock().unwrap(),
        &mut os_controls_clone.lock().unwrap(),
      ),
      _ => println!("Unhandled MPRIS event: {:?}", event),
    })
    .unwrap();

  let player_state_clone = player_state.clone();
  let library_clone = library.clone();
  let os_controls_clone = os_controls.clone();
  player.connect_end_of_stream(move |p| {
    next_song(
      &mut player_state_clone.lock().unwrap(),
      &library_clone.lock().unwrap(),
      &p,
      &mut os_controls_clone.lock().unwrap(),
    );
  });

  let context = Context {
    library,
    config: Arc::new(Mutex::new(config)),
    player: player,
    player_state,
    os_controls,
  };

  tauri::Builder::default()
    .plugin(rspc::integrations::tauri::plugin(
      router.arced(),
      move || context.clone(),
    ))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
