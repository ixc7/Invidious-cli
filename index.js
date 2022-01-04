import readline from 'readline'
import { spawn } from 'child_process'
import enquirer from 'enquirer'
import { searchRecursive } from './search.js'

const { AutoComplete } = enquirer
const VIDEO_PLAYER = 'mpv'
const MAX_PAGES = 3

if (!process.argv[2]) {
  console.log('please enter a search term')
  process.exit(0)
}

let searchTerm = process.argv.slice(2).join(' ')

console.clear()
console.log(`searching for: ${searchTerm}`)

const results = await searchRecursive(searchTerm, MAX_PAGES)
// let choices = ['CANCEL']
let choices = []

for (let key in results) {
  choices = choices.concat(results[key])
}


let acceptKeypress = false

const prompt = new AutoComplete({
  name: 'video',
  message: 'select a video',
  choices,
  limit: (process.stdout.rows - 4),
  validate: () => {
    return acceptKeypress === true
  }
})

prompt.on('keypress', (char, props) => {
  // console.log(props.name)
  readline.cursorTo(process.stdout, 0, process.stdout.rows - 2)
  readline.clearLine(process.stdout, 0)
  console.log('key pressed:', props.name || 'none')
  if (props.name !== 'return') acceptKeypress = true
  readline.cursorTo(process.stdout, 0, 0)
})

/*
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
*/

try {
  console.clear()
  const selection = await prompt.run()
  console.clear()
  console.log(`opening url with ${VIDEO_PLAYER}: ${selection}`)
  // const videoPlayer = spawn(
    // VIDEO_PLAYER,
    // [selection, '--fullscreen', '--loop', '--audio-pitch-correction=no'],
    // { detached: true, stdio: 'ignore' }
  // )
  // videoPlayer.unref()
  process.exit(0)
}

catch (e) {
  console.clear()
  console.log('exit')
  if (e) console.log(e)
  process.exit(0)
}
