import readline from 'readline'
import pkg from 'enquirer'
const { AutoComplete } = pkg
import { loadEnv, search, searchRecursive } from './search.js'

let searchTerm = 'hello world'
if (process.argv[2]) searchTerm = process.argv.slice(2).join(' ')

console.clear()
console.log(`searching for: ${searchTerm}`)

const results = await searchRecursive(searchTerm)
let choices = []

for (let key in results) {
  choices = choices.concat(results[key])
}

const prompt = new AutoComplete({
  name: 'video',
  message: 'select a video',
  choices,
  limit: (process.stdout.rows - 4)
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
  console.log('url:', selection)
}

catch (e) {
  console.clear()
  console.log('exit')
}
