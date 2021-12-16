#!/usr/bin/env node

import readline from 'readline'
import initTerm from './escape-sequences.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const term = initTerm()
term.hideCursor()

process.stdin.on('keypress', k => {
  term.clearScroll()
  term.hideCursor()
  if (k === 'q' || k === 'Q') {
    term.showCursor()
    process.exit(0)
  }
  console.log(k)
})
