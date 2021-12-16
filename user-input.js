#!/usr/bin/env node

import readline from 'readline'
import term from './escape-sequences.js'

const { clearScroll, showCursor, hideCursor, resetCursorPosition } = term()

const clear = () => {
  clearScroll()
  hideCursor()
  console.log('press [ctrl] <Qq> to exit')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('close', () => {
  clear()
  showCursor()
  process.exit(0)
})

process.stdin.on('keypress', (char, props) => {
  clear()
  
  if (char === 'q' || char === 'Q' || char === '\u0011') {
    showCursor()
    rl.close()
  }
  // TODO ctrl + <Qq>

  process.stdout.write(
    `\n\r${char}: {\n` +
    (['  {'])
    .concat(
      (JSON.stringify(props))
      .replaceAll('{', '')
      .replaceAll('}', '')
      .split(',')
      .map(x => `    ${x}`)
      .concat(['  }'])
    )
    .join('\n') +
    `\n\r}\n\n`
  )
})

clear()
