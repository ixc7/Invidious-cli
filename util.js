import { createInterface } from 'readline'
import { spawnSync } from 'child_process'

const bold = input => `\x1b[1m${input}\x1b[0m`
const clear = input => process.stdout.write(`\x1b[0m\x1Bc\x1b[3J${input || ''}`)
const mkTemp = () => spawnSync('mktemp', ['-d']).stdout.toString('utf8').split('\n').join('')

const mkInterface = (opts = {}) => {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
    ...opts
  })
}

export { bold, clear, mkInterface, mkTemp }
