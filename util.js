import { createInterface } from 'readline'
import { spawnSync } from 'child_process'
import { rmSync, existsSync } from 'fs'

export const bold = input => `\x1b[1m${input}\x1b[0m`
export const mktemp = () =>
  spawnSync('mktemp', ['-d']).stdout.toString('utf8').split('\n').join('')
export const rmdir = dir =>
  existsSync(dir) && rmSync(dir, { recursive: true, force: true })
export const gotoTop = () => process.stdout.write('\x1b[1;1H')
export const noScroll = () => process.stdout.write('\x1Bc\x1b[3J')

// renders faster than readline.cursorTo() in some cases
// const goto = (x, y) => process.stdout.write(`\x1b[${y};${x}H`)

export const formatTime = s => {
  const zeros = x => {
    const str = x.toString()
    if (str.length === 1) return `0${str}`
    return str
  }
  const min = zeros(Math.floor(s / 60))
  const sec = zeros(s - min * 60)
  return `${min}:${sec}`
}

export const mkInterface = (opts = {}) => {
  process.stdin.removeAllListeners('keypress')
  process.stdin.removeAllListeners('line')
  return createInterface({
    input: process.stdin,
    output: process.stdout,
    ...opts
  })
}

export const mkPrompt = (prompt = 'search: ') => {
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
