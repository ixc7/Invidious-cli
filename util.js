import { createInterface } from 'readline'
import { spawnSync } from 'child_process'
import { rmdirSync, existsSync } from 'fs'

const bold = input => `\x1b[1m${input}\x1b[0m`

// TODO async?
const mktemp = () => spawnSync('mktemp', ['-d']).stdout.toString('utf8').split('\n').join('')
const rmdir = dir => existsSync(dir) && rmdirSync(dir, { recursive: true, force: true })

const mkInterface = (opts = {}) => {
  process.stdin.removeAllListeners('keypress')
  process.stdin.removeAllListeners('line')
  return createInterface({
    input: process.stdin,
    output: process.stdout,
    ...opts
  })
}

const mkPrompt = (prompt = 'search: ') => {
  const rl = mkInterface({ prompt }) 
  return new Promise(resolve => {
    rl.on('line', line => {
      if (line.split('').filter(i => i !== ' ').length > 0) {
        rl.close()
        resolve(line)
      }
      rl.prompt()
    })
    rl.prompt()
  })
}

export { bold, mktemp, mkInterface, mkPrompt, rmdir }
