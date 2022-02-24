export const format = 'mp4'
export const downloader = 'yt-dlp'
export const player = 'mpv'
export const folder = './savedMedia'
export const save = false
export const pages = 3
export const downloaderOptions = ['--quiet', '--progress']
export const playerOptions = [
  '--audio-pitch-correction=no',
  '--autofit=50%',
  '--geometry=100%:100%',
  '--loop'
]

export default {
  format,
  downloader,
  downloaderOptions,
  player,
  playerOptions,
  save,
  folder,
  pages
}
