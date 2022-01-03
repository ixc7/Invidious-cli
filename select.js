import readline from 'readline'
import pkg from 'enquirer'
const { AutoComplete } = pkg
import { loadEnv, search, searchRecursive } from './search.js'

const results = (await searchRecursive())[1]

const prompt = new AutoComplete({
  name: 'flavor',
  message: 'Pick your favorite flavor',
  choices: results
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

process.stdin.on('keypress', (char, props) => {
  const prev = rl.getCursorPos()
  readline.cursorTo(process.stdout, 0, (process.stdout.rows - 3))
  console.log('key pressed:', char)
  readline.cursorTo(process.stdout, prev.cols, prev.rows)
  // readline.cursorTo(process.stdout, 0, 0)
})

const selection = await prompt.run()
console.log('selection:', selection)
