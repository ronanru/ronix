use crate::{library, Context};
use directories::{ProjectDirs, UserDirs};
use rspc::{Router, RouterBuilder, Type};
use serde::{Deserialize, Serialize};
use std::{
  fs::{create_dir_all, File},
  path::PathBuf,
};
use tauri::api::dialog::blocking::FileDialogBuilder;

#[derive(Serialize, Deserialize, Clone, Type, Debug)]
pub struct Config {
  pub music_folders: Vec<PathBuf>,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      music_folders: Vec::new(),
    }
  }
}

pub fn get_config_file_path() -> PathBuf {
  ProjectDirs::from("dev", "ronanru", "ronix")
    .unwrap()
    .config_dir()
    .join("config.json")
}

pub fn get_config_file() -> File {
  let config_file_path = get_config_file_path();
  File::open(&config_file_path).unwrap_or_else(|_| {
    create_dir_all(&config_file_path.parent().unwrap()).unwrap();
    let config_file = File::create(&config_file_path).unwrap();
    serde_json::to_writer_pretty(&config_file, &Config::default()).unwrap();
    config_file
  })
}

pub fn write_config_file(config: &Config) {
  let config_file_path = get_config_file_path();
  create_dir_all(&config_file_path.parent().unwrap()).unwrap();
  let config_file = File::create(&config_file_path).unwrap();
  serde_json::to_writer_pretty(&config_file, config).unwrap();
}

pub fn get_router() -> RouterBuilder<Context> {
  Router::<Context>::new()
    .query("get", |t| {
      t(|ctx, _: ()| ctx.config.lock().unwrap().clone())
    })
    .query("getDefaultMusicFolder", |t| {
      t(|_ctx, _input: ()| UserDirs::new().unwrap().audio_dir().unwrap().to_path_buf())
    })
    .query("pickFolder", |t| {
      t(|_ctx, _input: ()| async { FileDialogBuilder::new().pick_folder() })
    })
    .mutation("set", |t| {
      t(|ctx, input: Config| {
        println!("set config: {:?}", input);
        let mut config = ctx.config.lock().unwrap();
        if input.music_folders != config.music_folders {
          *ctx.library.lock().unwrap() = library::read_from_dirs(&input.music_folders)
        }
        write_config_file(&input);
        *config = input;
      })
    })
}
