import { spawn } from 'child_process'
import { bold, mkInterface, rmdir } from './util.js'
import {
  format,
  downloader,
  downloaderOpts
} from './config.js'

const pbcopy = data => {
  const proc = spawn('pbcopy')
  proc.stdin.write(data)
  proc.stdin.end()
}

const actuallyDownload = (title, file, url, dir) => {
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
    if (char === 'q') {
      rmdir(dir)
      child.kill()
    }
  })

  return new Promise(() => {
    child.on('exit', code => {
      if (code !== 0) console.log('download cancelled')
      else {
        pbcopy(`${dir}/${fileName}`)
        console.log(`saved ${dir}/${fileName}`)
      }
      process.exit(0)
    })
  })
}

export const download = (title, file, url, dir) => {
  const rl = mkInterface()

  console.clear()
  console.log('SAVE? [Y/N*]')

  return new Promise(() => {
    rl.on('line', line => {
      if (line.toLowerCase() === 'y') {
        // DOWNLOAD IT
        console.log(`\n${line}\nYES YOU WILL\n`)
      } else {
        // DO NOT DOWNLOAD IT
        console.log(`\n${line}\nNO YOU WONT\n`)
      }
      process.exit(0)
    })
  })
}
