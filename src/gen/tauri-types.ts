// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "config.get", input: never, result: Config } | 
        { key: "config.getDefaultMusicFolder", input: never, result: string } | 
        { key: "config.pickFolder", input: never, result: string | null } | 
        { key: "download.download", input: string, result: string } | 
        { key: "library.get", input: never, result: Library } | 
        { key: "library.search", input: SearchInput, result: SearchResults },
    mutations: 
        { key: "config.set", input: Config, result: null } | 
        { key: "library.deleteSong", input: string, result: string } | 
        { key: "library.editSong", input: EditSongInput, result: string } | 
        { key: "library.refresh", input: never, result: null } | 
        { key: "player.nextSong", input: never, result: null } | 
        { key: "player.playSong", input: PlaySongInput, result: null } | 
        { key: "player.previousSong", input: never, result: null } | 
        { key: "player.seek", input: number, result: null } | 
        { key: "player.setVolume", input: number, result: number } | 
        { key: "player.togglePause", input: never, result: null } | 
        { key: "player.toggleRepeatMode", input: never, result: RepeatMode } | 
        { key: "player.toggleShuffle", input: never, result: boolean },
    subscriptions: 
        { key: "player.currentSong", input: never, result: CurrentSongData }
};

export type RepeatMode = "None" | "One" | "All"

export type Song = { title: string; path: string; duration: number; album: string }

export type PlaySongInput = { song_id: string; scope: PlayerScope }

export type MainColor = "Slate" | "Gray" | "Zinc" | "Neutral" | "Stone"

export type SearchMode = "Library" | "Songs"

export type SearchInput = { query: string; mode: SearchMode }

export type SearchResults = { artists: string[] | null; albums: string[] | null; songs: string[] }

export type Library = { artists: { [key: string]: Artist }; albums: { [key: string]: Album }; songs: { [key: string]: Song } }

export type EditSongInput = { id: string; title: string; album: string; artist: string }

export type CurrentSongData = { current_song: string | null; song_started_at: number; paused_at: number | null; volume: number }

export type Album = { name: string; cover_art: string | null; artist: string }

export type Config = { music_folders: string[]; dark_mode: boolean; main_color: MainColor; accent_color: AccentColor }

export type PlayerScope = "Library" | { Album: string } | { Artist: string }

export type Artist = { name: string }

export type AccentColor = "Red" | "Orange" | "Amber" | "Yellow" | "Lime" | "Green" | "Emerald" | "Teal" | "Cyan" | "Blue" | "Indigo" | "Violet" | "Purple" | "Fuchsia" | "Pink" | "Rose"
