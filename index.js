import readline from 'readline'
import { spawn } from 'child_process'
import { Fzf } from 'fzf'
import { searchRecursive } from './search.js'

if (!process.argv[2]) {
  console.log('please enter a search term')
  process.exit(0)
}

const searchTerm = process.argv.slice(2).join(' ')
const VIDEO_PLAYER = 'mpv'
const MAX_PAGES = 1

console.clear()
console.log(`searching for ${searchTerm}`)
const searchResults = await searchRecursive(searchTerm, MAX_PAGES)
console.clear()
console.log('got results')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const fzf = new Fzf(searchResults, {
  selector: (item) => item.name
})

let input = ''
let selection = false

process.stdin.on('keypress', (char, props) => {
  console.clear()
  readline.cursorTo(process.stdout, 1, 0)

  // AND HERE WE HAVE TO CAPTURE ARROWS AND ENTER KEY AS WELL
  if (props.name === 'backspace') {
    input = input.substring(0, input.length - 1)
  } else if (char){
    input = input.concat(char)
  }
  
  const matches = fzf.find(input).map(match => match.item.name)
  // SO HERE WE HAVE TO COUNT ARROWS AND NOT CLEAR THE CONSOLE IF ITS ARROWS AND JUST UPDATE THE SELECTION.
  selection = matches[0]

  // THIS IS WHAT THE USER SEES.
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearLine(process.stdout, 0)
  console.log(input)
  console.log(matches)
  readline.cursorTo(process.stdout, input.length, 0)
})

// try {
  // console.clear()
  // console.log(`searching for: ${searchTerm}`)
  // const selection = await prompt.run()
  // console.clear()
  // console.log(`opening url with ${VIDEO_PLAYER}: ${selection}`)
  // const videoPlayer = spawn(
    // VIDEO_PLAYER,
    // [selection, '--fullscreen', '--loop', '--audio-pitch-correction=no'],
    // { detached: true, stdio: 'ignore' }
  // )
  // videoPlayer.unref()
  // process.exit(0)
// }

// catch (e) {
  // console.clear()
  // console.log('exit')
  // if (e) console.log('got error:\n', e)
  // process.exit(0)
// }
