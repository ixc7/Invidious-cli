
const musicPlayer = {
  downloader: 'yt-dlp', // || youtube-dl
  format: 'm4a', // yt-dlp --list-formats <url>, m4a = audio, mp4 = video
  player: 'mpv', // || anything else that takes the filename/path as the first argument
  playerOptions: [ // || anything else
    '--audio-pitch-correction=no',
    '--loop'
  ],
  pages: 1 // max pages to fetch
}

const videoPlayer = {
  downloader: 'yt-dlp', // || youtube-dl
  format: 'mp4', // yt-dlp --list-formats <url>, m4a = audio, mp4 = video
  player: 'mpv', // || anything else that takes the filename/path as the first argument
  playerOptions: [ // || anything else
    '--audio-pitch-correction=no',
    '--autofit=25%',
    '--geometry=100%:100%',
    '--ontop',
    '--loop',
  ],
  pages: 3 // max pages to fetch
}

export default musicPlayer
