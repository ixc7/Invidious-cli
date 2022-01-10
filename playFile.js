import { spawn } from 'child_process'
import { rmSync } from 'fs'
import { bold } from './util.js'

// open player
const playFile = (filePath, application) => {
  console.log(`\nplaying file with ${bold(application)}\npress ${bold('q')} to quit\n`)

  const player = spawn(
    application,
    [filePath, '--audio-pitch-correction=no', '--loop'],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  process.stdin.pipe(player.stdin)

  player.on('exit', code => {
    if (code !== 0) console.log(`error opening file: got exit code ${bold(code)}\n`)
    rmSync(filePath, { force: true })
    process.exit(0)
  })

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      player.kill()
      rmSync(filePath, { force: true })
      process.exit(0)
    }
  })
}

export default playFile
