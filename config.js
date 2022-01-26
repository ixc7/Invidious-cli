
const audioPlayerConfig = {
  format: 'm4a', // yt-dlp --list-formats <url> always has: m4a (audio), and mp4 (video)
  downloader: 'yt-dlp', // || youtube-dl
  downloaderOptions: [ // don't use '--progress' with youtube-dl (2021.12.17)
    '--quiet',
    '--progress'
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

const videoPlayerConfig = {
  format: 'mp4',
  downloader: 'yt-dlp', 
  downloaderOptions: [
    '--quiet',
    '--progress'
  ],
  player: 'mpv',
  playerOptions: [
    '--audio-pitch-correction=no',
    '--autofit=25%',
    '--geometry=100%:100%',
    '--ontop',
    '--loop',
  ],
  pages: 2,
  save: false,
  folder: './saved-videos'
}

export default audioPlayerConfig
// export default videoPlayerConfig
