import readline from 'readline'
import pkg from 'enquirer'
const { AutoComplete } = pkg
import { loadEnv, search, searchRecursive } from './search.js'

const results = (await searchRecursive())[1]

const prompt = new AutoComplete({
  name: 'video',
  message: 'select a video',
  choices: results
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.input.on('keypress', (char, props) => {
  readline.cursorTo(rl.output, 0, rl.output.rows - 2)
  readline.clearLine(rl.output, 0)
  console.log('key pressed:', props.name || 'none')
  readline.cursorTo(rl.output, 0, 0)
})

try {
  console.clear()
  const selection = await prompt.run()
  console.log('selection:', selection)
}
catch (e) {
  console.clear()
  console.log('exit')
}
