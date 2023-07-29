<h1>
  <img src="app-icon.svg" alt="">
  Ronix Music Player
</h1>

All linux music players suck, so I am making my own

![Screenshot](./screenshot.png)

## Download

Download Ronix AppImage from the [releases page](https://github.com/ronanru/ronix/releases).

## Features Roadmap

- [x] Plays music (All traditional music player features)
- [x] Fuzzy search
- [x] Multiple themes
- [ ] Song manager (Ability to edit song tags, delete songs)
- [ ] Song downloader with yt-dlp
- [ ] Publish on flathub, the AUR
- [ ] MacOS, Windows support

## How to start

- Install [pnpm](https://pnpm.io)
- Install dependencies with `pnpm i`
- Start in development mode with `pnpm tauri dev`
- Compile with `pnpm tauri build` (AppImage builds only on Ubuntu)
