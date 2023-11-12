export const format = 'mp4'
export const downloader = 'yt-dlp' // TODO: ffmpeg, spotdl, vlc, youtube-dl
export const player = 'mpvid'
export const folder = '/Users/admin/Music/invidious'
export const save = true
export const pages = 3
export const downloaderOpts = ['--quiet', '--progress']
export const playerOpts = [
  // '--audio-pitch-correction=no',
  // '--loop'
  // '--autofit=50%',
  // '--geometry=100%:100%',
]

export const config = {
  format,
  downloader,
  downloaderOpts,
  player,
  playerOpts,
  save,
  folder,
  pages
}

export default config
