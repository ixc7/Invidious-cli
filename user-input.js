#!/usr/bin/env node

import readline from 'readline'
import initTerm from './escape-sequences.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const term = initTerm()

const clear = (t = term) => {
  if (t.hasOwnProperty('clearScroll')) t.clearScroll()
  if (t.hasOwnProperty('hideCursor')) t.hideCursor()
  console.log('press <qQ> to exit')
}

clear(term)

process.stdin.on('keypress', k => {
  clear(term)
  if (k === 'q' || k === 'Q') {
    term.showCursor()
    process.exit(0)
  }
  process.stdout.write(k)
})
