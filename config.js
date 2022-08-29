// TODO ffmpeg
//      spotdl
//      vlc
//      youtube-dl

export const format = 'mp4'
export const downloader = 'yt-dlp'
export const player = 'mpv'
export const folder = './savedMedia'
export const save = false
export const pages = 3
export const downloaderOpts = ['--quiet', '--progress']
export const playerOpts = [
  '--audio-pitch-correction=no',
  '--autofit=50%',
  '--geometry=100%:100%',
  '--loop'
]

export default {
  format,
  downloader,
  downloaderOpts,
  player,
  playerOpts,
  save,
  folder,
  pages
}
