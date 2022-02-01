
/*
const audioPlayerConfig = {
  format: 'm4a', // yt-dlp --list-formats <url> always has: m4a (audio), and mp4 (video)
  downloader: 'yt-dlp', // || youtube-dl
  downloaderOptions: [
    '--quiet',
    '--progress' // don't use '--progress' with youtube-dl (2021.12.17)
  ],
  player: 'mpv', // || anything else that takes the filename/path as the first argument
  playerOptions: [ // || anything else
    '--audio-pitch-correction=no',
    '--loop'
  ],
  pages: 4, // max pages to fetch
  save: false, // save downloaded files
  folder: './saved-audio' // where to save
}
*/

// const videoPlayerConfig = {
const defaultConfig = {
  format: 'mp4',
  downloader: 'yt-dlp',
  downloaderOptions: [
    '--quiet',
    '--progress'
  ],
  player: 'mpv',
  playerOptions: [
    '--audio-pitch-correction=no',
    '--autofit=50%',
    '--geometry=100%:100%',
    // '--ontop',
    '--loop',
    '--window-minimized=yes' // (temp bugfix, keypresses get stuck on kitty terminal)
  ],
  pages: 10,
  save: false,
  folder: './saved-videos'
}

export default defaultConfig
