import { spawn } from 'child_process'
import { bold, mkInterface, rmdir } from './util.js'
import options from './options.js'
    const { player, playerOptions, repeat } = options

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

  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code !== 0) {
        console.log(`error opening file: got exit code ${bold(code)}\n`)
        reject()
      }
      resolve()
    })

    process.stdin.pipe(child.stdin)
    process.stdin.on('keypress', (char, props) => {
      if (char === 'q')  {
        child.kill()
        rmdir(dir)
        reject()
      }
    })
  })
}

const downloadFile = (title, file, url, dir) => {
  const { format, downloader, player } = options
  const fileName = `${file}.${format}`
  const filePath = `${dir}/${fileName}`

  // TODO is kill all other stdin listeners first handled already? does it need to be?
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
  
  return new Promise((resolve, reject) => {
    rl.input.on('keypress', (char, props) => {
      if (char === 'q')  {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        child.kill()
        rmdir(dir)
        console.log('\ndownload cancelled\n')
        if (!repeat) process.exit(0)
        reject()
      }
    })
  
    child.on('exit', code => {
      if (code !== 0) {
        console.log(`error downloading file: got exit code ${bold(code)}\n`)
        reject()
      } else {
        rl.close()
        process.stdin.removeAllListeners('keypress')
        resolve(openPlayer(fileName, dir))
      }
    })
  })
}

export { downloadFile, openPlayer }
