#!/usr/bin/env node

import { spawn } from 'child_process'
import { bold, mkInterface, rmdir, noScroll } from './util.js'
import {
  player,
  playerOpts,
  save,
  folder,
  format,
  downloader,
  downloaderOpts
} from './config.js'

export const open = (file, dir) => {
  return new Promise(() => {
    const filePath = `${dir}/${file}`
    const child = spawn(player, [filePath, ...playerOpts], {
      stdio: ['pipe', process.stdout, process.stderr]
    })

    process.stdin.pipe(child.stdin)

    // TODO fix keypress sending to mpv
    //      ffmpeg
    child.on('spawn', () =>
      console.log(`
        \rplaying file with ${bold(player)}
        \rpress ${bold('q')} to quit
      `)
    )

    child.on('exit', async code => {
      if (code !== 0) {
        console.log('error opening file')
        rmdir(dir)
        process.exit(0)
      }

      // TODO do not delete the entire folder
      if (!save) rmdir(dir)

      // TODO else, prompt
      else console.log(`saved '${file}' to '${folder}'`)
      process.exit(0)
    })
  })
}

// TODO expect object {}
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
    noScroll()
    console.log(`
      \rvideo: ${bold(title)}
      \rurl: ${bold(url)}
      \rdownloading file with ${bold(downloader)}
      \rpress ${bold('q')} to cancel
    `)
  })

  rl.input.on('keypress', char => {
    if (char === 'q') {
      rmdir(dir)
      child.kill()
    }
  })

  return new Promise(resolve => {
    child.on('exit', async code => {
      if (code !== 0) {
        console.log('\ndownload cancelled')

        // EXIT loop
        process.exit(0)
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')

        // CONTINUE loop
        resolve(await open(fileName, dir))
      }
    })
  })
}
