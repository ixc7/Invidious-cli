import { spawn } from 'child_process'
import { rmSync } from 'fs'
import { bold, mkInterface } from './util.js'
import {
  player,
  playerOpts,
  format,
  downloader,
  downloaderOpts
} from './config.js'

const pbcopy = data => {
  const proc = spawn('pbcopy')
  proc.stdin.write(data)
  proc.stdin.end()
}

const playMedia = filePath => {
  const child = spawn(player, [filePath, ...playerOpts], {
    stdio: ['pipe', process.stdout, process.stderr]
  })
  return new Promise(resolve => {
    child.on('exit', () => resolve())
  })
}

const savePrompt = filePath => {
  const rl = mkInterface()

  process.stdout.write('\nSAVE? [Y/N*] ')

  return new Promise(resolve => {
    rl.on('line', line => {
      if (line.toLowerCase() === 'y') {
        pbcopy(filePath)
        console.log(`COPIED TO CLIPBOARD ${filePath}`)
      } else {
        rmSync(filePath)
        console.log(`REMOVED ${filePath}`)
      }
      resolve()
    })
  })
}

export const download = (title, file, url, dir) => {
  const fileName = `${file}.${format}`
  const filePath = `${dir}/${fileName}`
  const rl = mkInterface()
  const child = spawn(
    downloader,
    [`--format=${format}`, `--output=${filePath}`, ...downloaderOpts, url],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  child.on('spawn', () => {
    console.clear()
    console.log(`
      \rvideo: ${bold(title)}
      \rurl: ${bold(url)}
      \rdownloading file with ${bold(downloader)}
      \rpress ${bold('q')} to cancel
    `)
  })

  rl.input.on('keypress', char => {
    if (char === 'q') child.kill()
  })

  return new Promise(() => {
    child.on('exit', async exitCode => {
      if (exitCode !== 0) {
        rmSync(filePath)
        console.log('download cancelled')
      } else {
        await playMedia(filePath)
        await savePrompt(filePath)
      }
      process.exit(0)
    })
  })
}
