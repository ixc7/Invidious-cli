export default {
  pages: 3,
  format: 'm4a', // yt-dlp --list-formats <url>
  downloader: 'yt-dlp',
  player: 'mpv',
  playerOptions: ['--audio-pitch-correction=no', '--loop']
}
