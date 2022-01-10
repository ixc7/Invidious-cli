import { spawn, spawnSync } from 'child_process'
import { bold, clear, mkInterface, mkTemp } from './util.js'
import playFile from './playFile.js'

// download audio
const downloadFile = (selection, file, url, format = 'm4a', fileDownloader = 'yt-dlp', filePlayer = 'mpv') => {
  clear(`\nvideo: ${bold(selection)}\nurl: ${bold(url)}\n\ndownloading file with ${bold(fileDownloader)}\npress ${bold('q')} to cancel\n`)
  const directory = mkTemp()
  const filePath = `${directory}/${file}.${format}` 

  const downloader = spawn(
    fileDownloader,
    [
      `--format=${format}`,
      '--quiet',
      '--progress',
      `--output=${filePath}`,
      url
    ],
    {
      stdio: ['pipe', process.stdout, process.stderr]
    }
  )

  const rl = mkInterface()

  rl.input.on('keypress', (char, props) => {
    if (char === 'q')  {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      downloader.kill()
      rmSync(`${filePath}.part`, { force: true })
      console.log('\ndownload cancelled\n')
      process.exit(0)
    }
  })  

  downloader.on('exit', code => {
    if (code !== 0) {
      console.log(`error downloading file: got exit code ${bold(code)}\n`)
      process.exit(0)
    } else {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      playFile(filePath, filePlayer)
    }
  })
}

export default downloadFile
