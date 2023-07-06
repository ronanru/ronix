use base64::{engine::general_purpose, Engine as _};
use lofty::{Accessor, AudioFile, Probe, TaggedFileExt};
use nanoid::nanoid;
use rand::prelude::*;
use rspc::Type;
use serde::Serialize;
use std::{collections::HashMap, hash::Hash, path::PathBuf};
use walkdir::WalkDir;

use crate::PlayerScope;

#[derive(Serialize, Clone, Type, Hash)]
pub struct Artist {
  pub name: String,
}

#[derive(Serialize, Clone, Type, Hash)]
pub struct Album {
  pub name: String,
  pub cover_art: Option<String>,
  pub artist: String,
}

#[derive(Serialize, Clone, Type, Hash)]
pub struct Song {
  pub title: String,
  pub path: PathBuf,
  pub duration: u32,
  pub album: String,
}

#[derive(Serialize, Clone, Type)]
pub struct Library {
  pub artists: HashMap<String, Artist>,
  pub albums: HashMap<String, Album>,
  pub songs: HashMap<String, Song>,
}

pub fn read_from_dirs(dirs: &Vec<PathBuf>) -> Library {
  let mut artists: HashMap<String, Artist> = HashMap::new();
  let mut albums: HashMap<String, Album> = HashMap::new();
  let mut songs: HashMap<String, Song> = HashMap::new();

  for dir in dirs.iter() {
    for file_res in WalkDir::new(dir) {
      if let Ok(file) = file_res {
        if file.file_type().is_file() {
          if let Some(tagged_file) = Probe::open(file.path())
            .ok()
            .map(|p| p.read().ok())
            .flatten()
          {
            if let Some(tags) = match tagged_file.primary_tag() {
              Some(primary_tag) => Some(primary_tag),
              None => tagged_file.first_tag(),
            } {
              let artist_name = tags
                .artist()
                .as_deref()
                .unwrap_or("Unknown Artist")
                .to_string();
              let album_name = tags
                .album()
                .as_deref()
                .unwrap_or("Unknown Album")
                .to_string();
              let title = tags.title().as_deref().unwrap_or("Unknown").to_string();
              let path = file.path().to_path_buf();
              let duration = tagged_file.properties().duration().as_millis();
              let artist_id = match artists.iter().find(|a| a.1.name == artist_name) {
                Some(artist) => artist.0.clone(),
                None => {
                  let id = nanoid!();
                  artists.insert(
                    id.clone(),
                    Artist {
                      name: artist_name.clone(),
                    },
                  );
                  id
                }
              };
              let album = match albums
                .iter()
                .find(|a| a.1.artist == artist_id && a.1.name == album_name)
              {
                Some(album) => album.0.clone(),
                None => {
                  let id = nanoid!();
                  albums.insert(
                    id.clone(),
                    Album {
                      name: album_name,
                      cover_art: if tags.picture_count() > 0 {
                        Some(format!(
                          "data:{};base64,{}",
                          &tags.pictures()[0].mime_type().to_string(),
                          general_purpose::URL_SAFE.encode(tags.pictures()[0].data())
                        ))
                      } else {
                        None
                      },
                      artist: artist_id,
                    },
                  );
                  id
                }
              };
              songs.insert(
                nanoid!(),
                Song {
                  title,
                  path,
                  duration: duration as u32,
                  album,
                },
              );
            }
          }
        }
      }
    }
  }
  Library {
    artists,
    albums,
    songs,
  }
}

pub fn get_automatic_next_songs(
  library: &Library,
  current_song_id: &String,
  is_shuffled: bool,
  scope: &PlayerScope,
) -> Vec<String> {
  let mut songs_vec: Vec<(String, &String)> = library
    .songs
    .iter()
    .filter(|(_, song)| match scope {
      PlayerScope::Library => true,
      PlayerScope::Album(album_id) => song.album.as_str() == album_id,
      PlayerScope::Artist(artist_id) => {
        library.albums.get(&song.album).unwrap().artist.as_str() == artist_id
      }
    })
    .map(|(id, song)| (id.clone(), &song.title))
    .collect();
  if is_shuffled {
    let rng = &mut thread_rng();
    songs_vec.shuffle(rng);
  } else {
    songs_vec.sort_by(|a, b| b.1.cmp(a.1));
  }
  let current_song_index = songs_vec
    .iter()
    .position(|(id, _)| id == current_song_id)
    .unwrap();
  songs_vec.rotate_left(current_song_index);
  songs_vec.remove(0);
  songs_vec.iter().map(|(id, _)| id).cloned().collect()
}
