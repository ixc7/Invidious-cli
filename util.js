import { createInterface, cursorTo } from 'readline'
import { spawnSync } from 'child_process'
import { rmSync, existsSync } from 'fs'

export const bold = input => `\x1b[1m${input}\x1b[0m`

export const gotoTop = () => cursorTo(0, 0)

export const sanitize = str => str.replace(/([^a-z0-9]+)/gi, '-')

export const mktemp = () =>
  spawnSync('mktemp', ['-d']).stdout.toString('utf8').replaceAll('\n', '')

export const rmdir = dir => existsSync(dir) && rmSync(dir, { recursive: true, force: true })

export const fmtTime = s => {
  const zeros = n => {
    const str = n.toString()
    if (str.length === 1) return `0${str}`
    return str
  }
  const min = zeros(Math.floor(s / 60))
  const sec = zeros(s - min * 60)
  return `${min}:${sec}`
}

// TODO: does this break from using process from THIS file instead????
export const mkInterface = (opts, { stdin, stdout } = process) => {
  stdin.removeAllListeners('keypress')
  stdin.removeAllListeners('line')
  return createInterface({
    input: stdin,
    output: stdout,
    ...opts
  })
}

export const mkPrompt = (prompt = 'search: ') => {
  const rl = mkInterface({ prompt })
  return new Promise(resolve => {
    rl.on('line', str => {
      if (str.replaceAll(' ', '').length > 0) {
        rl.close()
        resolve(str)
      }
      rl.prompt()
    })
    rl.prompt()
  })
}
