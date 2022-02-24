import { spawn } from 'child_process'
import { bold, mkInterface, rmdir, noScroll } from './util.js'
import {
  player,
  playerOptions,
  save,
  folder,
  format,
  downloader,
  downloaderOptions
} from './config.js'

export const openPlayer = (file, dir) => {
  return new Promise(() => {
    const filePath = `${dir}/${file}`
    const child = spawn(player, [filePath, ...playerOptions], {
      stdio: ['pipe', process.stdout, process.stderr]
    })

    child.on('spawn', () =>
      console.log(`
        \rplaying file with ${bold(player)}
        \rpress ${bold('q')} to quit
      `)
    )

    process.stdin.pipe(child.stdin)

    child.on('exit', async code => {
      if (code !== 0) {
        console.log('error opening file')
        rmdir(dir)
        process.exit(0)
      }

      if (!save) rmdir(dir)
      // TODO dont delete the entire folder if not empty.
      //      could move from mktemp to destination
      else console.log(`saved '${file}' to '${folder}'`)
      process.exit(0)
    })
  })
}

export const download = (title, file, url, dir) => {
  const fileName = `${file}.${format}`
  const filePath = `${dir}/${fileName}`

  const rl = mkInterface()
  const child = spawn(
    downloader,
    [`--format=${format}`, `--output=${filePath}`, ...downloaderOptions, url],
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

  rl.input.on('keypress', (char, props) => {
    if (char === 'q') {
      rmdir(dir)
      child.kill()
    }
  })

  return new Promise(resolve => {
    child.on('exit', async code => {
      if (code !== 0) {
        console.log('\ndownload cancelled')
        process.exit(0)
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        resolve(await openPlayer(fileName, dir))
      }
    })
  })
}

export default download
