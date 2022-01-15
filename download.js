import { spawn } from 'child_process'
import { rmdirSync } from 'fs'
import { bold, mkInterface, mkTemp } from './util.js'

// open player
const openPlayer = (fileName, directory, application ='mpv', opts = []) => {
  console.log(`\nplaying file with ${bold(application)}\npress ${bold('q')} to quit\n`)

  const filePath = `${directory}/${fileName}`
  
  const player = spawn(
    application,
    [filePath, ...opts],
    // [filePath, '--audio-pitch-correction=no', '--loop'],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  process.stdin.pipe(player.stdin)

  player.on('exit', code => {
    if (code !== 0) console.log(`error opening file: got exit code ${bold(code)}\n`)
    rmdirSync(directory, { recursive: true, force: true })
    process.exit(0)
  })

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      player.kill()
      rmdirSync(directory, { recursive: true, force: true })
      process.exit(0)
    }
  })
}


// download url
const downloadFile = (selection, file, url, directory, format = 'm4a', application = 'yt-dlp', filePlayer = 'mpv') => {
  console.clear()
  console.log(`\nvideo: ${bold(selection)}\nurl: ${bold(url)}\n\ndownloading file with ${bold(application)}\npress ${bold('q')} to cancel\n`)

  const fileName = `${file}.${format}`
  const filePath = `${directory}/${fileName}`
  const rl = mkInterface()
  
  const downloader = spawn(
    application,
    [
      `--format=${format}`,
      '--quiet',
      '--progress',
      `--output=${filePath}`,
      url
    ],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )
  
  rl.input.on('keypress', (char, props) => {
    if (char === 'q')  {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      downloader.kill()
      rmdirSync(directory, { recursive: true, force: true })

      console.log('\ndownload cancelled\n')
      process.exit(0)
    }
  })
  return new Promise((resolve, reject) => {
    downloader.on('exit', code => {
      if (code !== 0) {
        console.log(`error downloading file: got exit code ${bold(code)}\n`)
        reject()
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        openPlayer(fileName, directory, filePlayer)
      }
    })
  })
}

export { downloadFile, openPlayer }
