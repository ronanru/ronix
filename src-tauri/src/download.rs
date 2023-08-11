use crate::{library, Context};
use rspc::{Router, RouterBuilder, Type};
use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Type)]
struct YoutubeVideo {
  title: String,
  id: String,
}

pub fn get_router() -> RouterBuilder<Context> {
  Router::<Context>::new().query("download", |t| {
    t(|ctx, input: String| {
      let folders = ctx.config.lock().unwrap().music_folders.clone();
      let ytdl = Command::new("yt-dlp")
        .args([
          "-f",
          "bestaudio",
          "-x",
          "--audio-format",
          "mp3",
          "--add-metadata",
          &input,
        ])
        .current_dir(&folders[0])
        .status();
      if !ytdl.map(|s| s.success()).unwrap_or(false) {
        return "Failed to download video with yt-dlp";
      }
      let sacad = Command::new("sacad_r")
        .args(["-f", ".", "600", "+"])
        .current_dir(&folders[0])
        .status();
      if !sacad.map(|s| s.success()).unwrap_or(false) {
        return "Failed to download cover art with sacad_r";
      }
      *ctx.library.lock().unwrap() = library::read_from_dirs(&folders);
      "Download successful"
    })
  })
}
