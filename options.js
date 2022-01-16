export default {
  downloader: 'yt-dlp', // || youtube-dl
  format: 'm4a', // yt-dlp --list-formats <url>, m4a = audio, mp4 = video
  player: 'mpv', // || anything else that takes the filename/path as the first argument
  playerOptions: ['--audio-pitch-correction=no', '--loop'], // || anything else
  pages: 3, // max pages to fetch
  repeat: true // repeat search the prompt forever
}
