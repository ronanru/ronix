use crate::{Context, PlayerScope};
use fuse_rust::Fuse;
use lofty::{Accessor, AudioFile, MimeType, Probe, TagExt, TaggedFileExt};
use nanoid::nanoid;
use rand::prelude::*;
use rspc::{Router, RouterBuilder, Type};
use serde::{Deserialize, Serialize};
use std::{
  collections::HashMap,
  fs::{self, create_dir_all, File},
  hash::Hash,
  io::Write,
  path::PathBuf,
  process::Command,
};
use walkdir::WalkDir;

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

  let temp_dir = std::env::temp_dir().join("ronix-covers");
  create_dir_all(&temp_dir).unwrap();

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
              let duration = tagged_file.properties().duration().as_secs();
              let artist_id = match artists.iter().find(|a| a.1.name == artist_name) {
                Some(artist) => artist.0.clone(),
                None => {
                  let id = nanoid!();
                  artists.insert(
                    id.clone(),
                    Artist {
                      name: artist_name.to_string(),
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
                  let cover_art = if tags.picture_count() > 0 {
                    let path =
                      temp_dir
                        .join(&id)
                        .with_extension(match tags.pictures()[0].mime_type() {
                          MimeType::Bmp => "bmp",
                          MimeType::Jpeg => "jpg",
                          MimeType::Png => "png",
                          MimeType::Tiff => "tiff",
                          MimeType::Unknown(t) => t.split('/').last().unwrap(),
                          _ => "jpg",
                        });
                    let mut file = File::create(&path).unwrap();
                    file.write_all(tags.pictures()[0].data()).unwrap();
                    fs::write(&path, tags.pictures()[0].data()).unwrap();
                    Some(path.to_str().unwrap().to_string())
                  } else {
                    None
                  };
                  albums.insert(
                    id.clone(),
                    Album {
                      name: album_name,
                      cover_art,
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

#[derive(Serialize, Type)]
struct SearchResults {
  artists: Option<Vec<String>>,
  albums: Option<Vec<String>>,
  songs: Vec<String>,
}

#[derive(Deserialize, Type)]
struct EditSongInput {
  id: String,
  title: String,
  album: String,
  artist: String,
}

#[derive(Deserialize, Type)]
enum SearchMode {
  Library,
  Songs,
}

#[derive(Deserialize, Type)]
struct SearchInput {
  query: String,
  mode: SearchMode,
}

pub fn get_router() -> RouterBuilder<Context> {
  Router::<Context>::new()
    .query("get", |t| {
      t(|ctx, _input: ()| ctx.library.lock().unwrap().clone())
    })
    .query("search", |t| {
      t(|ctx, input: SearchInput| {
        let library = ctx.library.lock().unwrap();
        let fuse = Fuse {
          location: 0,
          distance: 100,
          threshold: 0.3,
          max_pattern_length: 32,
          is_case_sensitive: false,
          tokenize: false,
        };
        let artists: Vec<String> = fuse
          .search_text_in_iterable(
            &input.query,
            library.artists.iter().map(|(_, artist)| &artist.name),
          )
          .iter()
          .map(|a| library.artists.iter().nth(a.index).unwrap().0.to_string())
          .collect();
        let albums: Vec<String> = fuse
          .search_text_in_iterable(
            &input.query,
            library.albums.iter().map(|(_, album)| &album.name),
          )
          .iter()
          .map(|a| library.albums.iter().nth(a.index).unwrap().0.to_string())
          .collect();
        let mut songs: Vec<String> = fuse
          .search_text_in_iterable(
            &input.query,
            library.songs.iter().map(|(_, song)| &song.title),
          )
          .iter()
          .map(|a| library.songs.iter().nth(a.index).unwrap().0.to_string())
          .collect();
        match input.mode {
          SearchMode::Library => SearchResults {
            artists: Some(artists),
            albums: Some(albums),
            songs: songs,
          },
          SearchMode::Songs => {
            songs.extend(
              library
                .songs
                .iter()
                .filter_map(|(song_id, song)| {
                  if songs.contains(song_id) {
                    return Some(song_id);
                  }
                  if albums.contains(&song.album) {
                    return Some(song_id);
                  }
                  let album = library.albums.get(&song.album).unwrap();
                  if artists.contains(&album.artist) {
                    return Some(song_id);
                  }
                  return None;
                })
                .cloned()
                .collect::<Vec<String>>(),
            );
            SearchResults {
              artists: None,
              albums: None,
              songs,
            }
          }
        }
      })
    })
    .mutation("deleteSong", |t| {
      t(|ctx, input: String| {
        let mut library = ctx.library.lock().unwrap();
        match library.songs.get(&input) {
          Some(song) => match fs::remove_file(&song.path) {
            Ok(_) => {
              library.songs.remove(&input);
              "Successfully deleted".to_string()
            }
            Err(e) => e.to_string(),
          },
          None => "Could not find song to delete".to_string(),
        }
      })
    })
    .mutation("editSong", |t| {
      t(|ctx, input: EditSongInput| {
        let mut library = ctx.library.lock().unwrap();
        match library.songs.get(&input.id) {
          Some(song) => {
            match Probe::open(&song.path)
              .ok()
              .map(|f| f.read().ok())
              .flatten()
            {
              Some(mut tagged_file) => {
                let tags_option = match tagged_file.primary_tag_mut() {
                  Some(primary_tag) => Some(primary_tag),
                  None => tagged_file.first_tag_mut(),
                };
                match tags_option {
                  Some(tags) => {
                    tags.set_title(input.title);
                    tags.set_album(input.album);
                    tags.set_artist(input.artist);
                    for i in 0..tags.picture_count() {
                      tags.remove_picture(i as usize);
                    }
                    if tags.save_to_path(&song.path).is_err() {
                      return "Failed to edit song";
                    }
                    let sacad = Command::new("sacad_r")
                      .args(["-f", ".", "600", "+"])
                      .current_dir(&song.path.parent().unwrap())
                      .status();
                    if !sacad.map(|s| s.success()).unwrap_or(false) {
                      return "Failed to download cover art with sacad_r";
                    }
                    *library = read_from_dirs(&ctx.config.lock().unwrap().music_folders);
                    "Successfully edited"
                  }
                  None => "Could not edit song",
                }
              }
              None => "Could not find song to edit",
            }
          }
          None => "Could not find song to edit",
        }
      })
    })
    .mutation("refresh", |t| {
      t(|ctx, _: ()| {
        *ctx.library.lock().unwrap() = read_from_dirs(&ctx.config.lock().unwrap().music_folders);
      })
    })
}
