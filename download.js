import { spawn } from 'child_process'
import { bold, mkInterface, rmdir } from './util.js'
import config from './config.js'
const { player, playerOptions } = config

const openPlayer = (file, dir) => {
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
  
  process.stdin.pipe(child.stdin)

  return new Promise(() => {
    child.on('exit', code => {
      if (code !== 0) console.log('error opening file')
      rmdir(dir)
      process.exit(0)
    })
  })
}

const downloadFile = (title, file, url, dir) => {
  const { format, downloader, player } = config
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
    console.log(
      `\n\rvideo: ${bold(title)}
      \rurl: ${bold(url)}
      \rdownloading file with ${bold(downloader)}
      \rpress ${bold('q')} to cancel`
    )
  })
  
  rl.input.on('keypress', (char, props) => {
    if (char === 'q') {
      rmdir(dir)
      child.kill()
    }
  })
  
  return new Promise(resolve => {
    child.on('exit', code => {
      if (code !== 0) {
        console.log('\ndownload cancelled')
        process.exit(0)
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        resolve(openPlayer(fileName, dir))
      }
    })
  })
}

export default downloadFile
