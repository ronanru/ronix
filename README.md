<h1>
  <img src="app-icon.svg" alt="">
  Ronix Music Player
</h1>

All linux music players suck, so I am making my own

![Screenshot](./screenshot.png)

## Installing

### On Arch Linux

Install from the [AUR](https://aur.archlinux.org/packages/ronix)

```sh
paru -S ronix
# yay -S ronix
# Or install ronix with your favorite AUR helper
```

### Not on Arch Linux

Get the AppImage [here](https://github.com/ronanru/ronix/releases/tag/v0.2.0)

## Features Roadmap

- [x] Plays music (All traditional music player features)
- [x] Fuzzy search
- [x] Multiple themes
- [ ] Song manager (Ability to edit song tags, delete songs)
- [x] Song downloader with yt-dlp
- [x] Publish on the AUR
- [ ] Publish on flathub
- [ ] MacOS, Windows support

## How to start

- Install [pnpm](https://pnpm.io)
- Install dependencies with `pnpm i`
- Start in development mode with `pnpm tauri dev`
- Compile with `pnpm tauri build` (AppImage builds only on Ubuntu)
