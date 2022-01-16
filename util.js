import { createInterface } from 'readline'
import { spawnSync } from 'child_process'

const bold = input => `\x1b[1m${input}\x1b[0m`

const mkTemp = () => spawnSync('mktemp', ['-d']).stdout.toString('utf8').split('\n').join('')

const mkInterface = (opts = {}) => {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
    ...opts
  })
}

const mkPrompt = (prompt = 'search: ') => {
  return new Promise(resolve => {
    const rl = mkInterface({ prompt }) 
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

export { bold, mkTemp, mkInterface, mkPrompt }
