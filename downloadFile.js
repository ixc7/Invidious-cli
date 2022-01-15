import { spawn } from 'child_process'
import { rmdirSync } from 'fs'
import { bold, mkInterface, mkTemp } from './util.js'
import playFile from './playFile.js'

// download audio
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
        playFile(fileName, directory, filePlayer)
      }
    })
  })
}

export default downloadFile
