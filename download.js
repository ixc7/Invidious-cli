import { spawn } from 'child_process'
import { rmdirSync } from 'fs'
import { bold, mkInterface, mkTemp } from './util.js'

// const playerDefaultOpts = ['--audio-pitch-correction=no', '--loop']

const cleanup = dir => {
  if (dir) rmdirSync(dir, { recursive: true, force: true })
  process.exit(0)
}

const defaults = {
  format: 'm4a',
  downloader: 'yt-dlp',
  player: 'mpv',
  playerOpts: ['--audio-pitch-correction=no', '--loop']
}

// open player
// const openPlayer = (file, dir, player  = defaults.player, opts = defaults.playerOpts) => {
const openPlayer = (file, dir, opts = defaults) => {
  const { player, playerOpts } = opts
  const filePath = `${dir}/${file}`
  
  const child = spawn(
    player,
    [filePath, ...playerOpts],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  process.stdin.pipe(child.stdin)

  child.on('spawn', () => console.log(`playing file with ${bold(player)}\npress ${bold('q')} to quit\n`))

  child.on('exit', code => {
    if (code !== 0) console.log(`error opening file: got exit code ${bold(code)}\n`)
    cleanup(dir)
    // rmdirSync(dir, { recursive: true, force: true })
    // process.exit(0)
  })

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      child.kill()
      cleanup(dir)
      // rmdirSync(dir, { recursive: true, force: true })
      // process.exit(0)
    }
  })
}


// download url
const downloadFile = (selection, file, url, dir, opts = defaults) => {
  const { format, downloader, player } = opts
  const fileName = `${file}.${format}`
  const filePath = `${dir}/${fileName}`

  const rl = mkInterface()

  const child = spawn(
    downloader,
    [
      '--quiet',
      '--progress',
      `--format=${format}`,
      `--output=${filePath}`,
      url
    ],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  child.on('spawn', () => {
    console.clear()
    console.log(`
      \rvideo: ${bold(selection)}
      \rurl: ${bold(url)}

      \rdownloading file with ${bold(downloader)}
      \rpress ${bold('q')} to cancel
    `)

  })
  
  rl.input.on('keypress', (char, props) => {
    if (char === 'q')  {
      rl.close()
      child.kill()
      process.stdin.removeAllListeners('keypress')
      console.log('\ndownload cancelled\n')

      cleanup(dir)
      // rmdirSync(dir, { recursive: true, force: true })
      // process.exit(0)
    }
  })
  
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code !== 0) {
        console.log(`error downloading file: got exit code ${bold(code)}\n`)
        reject()
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        openPlayer(fileName, dir)
      }
    })
  })
}

export { downloadFile, openPlayer }
