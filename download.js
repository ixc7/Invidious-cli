import { spawn } from 'child_process'
import { rmdirSync } from 'fs'
import { bold, mkInterface, mkTemp } from './util.js'
import defaultOptions from './options.js'
// const defaultOptions = {
  // format: 'm4a',
  // downloader: 'yt-dlp',
  // player: 'mpv',
  // playerOptions: ['--audio-pitch-correction=no', '--loop']
// }

const cleanup = dir => {
  if (dir) rmdirSync(dir, { recursive: true, force: true })
  process.exit(0)
}

const openPlayer = (file, dir, opts = defaultOptions) => {
  const { player, playerOptions } = opts
  const filePath = `${dir}/${file}`
  const child = spawn(
    player,
    [filePath, ...playerOptions],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )
  
  child.on('spawn', () => console.log(`
    \rplaying file with ${bold(player)}
    \rpress ${bold('q')} to quit
  `))

  child.on('exit', code => {
    if (code !== 0) console.log(`error opening file: got exit code ${bold(code)}\n`)
    cleanup(dir)
  })

  process.stdin.pipe(child.stdin)
  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      child.kill()
      cleanup(dir)
    }
  })
}

const downloadFile = (title, file, url, dir, opts = defaultOptions) => {
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
      \rvideo: ${bold(title)}
      \rurl: ${bold(url)}\n
      \rdownloading file with ${bold(downloader)}
      \rpress ${bold('q')} to cancel
    `)
  })
  
  rl.input.on('keypress', (char, props) => {
    if (char === 'q')  {
      console.log('\ndownload cancelled\n')
      rl.close()
      process.stdin.removeAllListeners('keypress')
      child.kill()
      cleanup(dir)
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
