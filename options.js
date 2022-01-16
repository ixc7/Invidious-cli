export default {
  downloader: 'yt-dlp', // || youtube-dl
  format: 'm4a', // yt-dlp --list-formats <url>, m4a = audio, mp4 = video
  player: 'mpv', // || anything else that takes the filename/path as the first argument
  playerOptions: [ // || anything else
    '--audio-pitch-correction=no',
    '--loop'
  ],
  pages: 3, // max pages to fetch
  repeat: true // repeat search the prompt forever
}
