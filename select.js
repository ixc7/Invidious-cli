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
  // rl.cursorTo(0, 0)
  readline.cursorTo(process.stdout, 50, 0)
  console.log('keypress', char, char, char)
})

prompt.run()
  .then(answer => console.log('Answer:', answer))
  .catch(console.error)
