<h1>
  <img src="app-icon.svg" alt="">
  Ronix Music Player
</h1>

All linux music players suck, so I am making my own

![Screenshot](./screenshot.png)

## Installing

### On Arch Linux

```sh
git clone https://github.com/ronanru/ronix.git
cd ronix
makepkg -si
```

### Not on Arch Linux

Get the AppImage [here](https://github.com/ronanru/ronix/releases/tag/v0.2.0)

## Features Roadmap

- [x] Plays music (All traditional music player features)
- [x] Fuzzy search
- [x] Multiple themes
- [ ] Song manager (Ability to edit song tags, delete songs)
- [x] Song downloader with yt-dlp
- [ ] Publish on flathub, the AUR
- [ ] MacOS, Windows support

## How to start

- Install [pnpm](https://pnpm.io)
- Install dependencies with `pnpm i`
- Start in development mode with `pnpm tauri dev`
- Compile with `pnpm tauri build` (AppImage builds only on Ubuntu)
