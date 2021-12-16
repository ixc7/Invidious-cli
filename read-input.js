#!/usr/bin/env node

import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

process.stdin.on('keypress', k => {
  if (k === 'q') process.exit(0)
  console.clear()
  console.log(k)
})




/*
import child_process from 'child_process'
import readline from 'readline'
import path from 'path'
import fs from 'fs'

const textEdit = (t, p) => Buffer.from(child_process.execSync(`$(which ${t}) ${p}`)).toString('utf8')
const fg = x => y => process.stdout.write(`\x1b[38;5;${x}m${y}\x1b[0m\n`)
const { green, red, error } = (() => {
  return {
    green: (p) => fg(47)(textEdit('micro', p)),
    red: (p) => fg(52)(textEdit('micro', p)),
    error: fg(52)
  }
})()

// green(new URL(import.meta.url).pathname)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const actions = {
  s: () => {
    console.clear()
    fs.readdirSync(path.resolve(path.resolve())).forEach(file => {
      console.log(file)
    })
    console.log('\n\ncurrent dir:\n', path.resolve(path.resolve()))
    console.log('\nsource file:\n', new URL(import.meta.url).pathname)
    console.log('\nsource props:\n', path.parse(new URL(import.meta.url).pathname), '\n')
    console.log('\n\nenv variables:\n\n', process.env, '\n\n')   
  },
  g: () => green(new URL(import.meta.url).pathname)
}

process.stdin.on('keypress', k => {
  if (Object.prototype.hasOwnProperty.call(actions, k)) actions[k]()
})
*/
