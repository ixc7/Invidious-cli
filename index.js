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

console.log(`searching for ${searchTerm}`)
const searchResults = await searchRecursive(searchTerm, MAX_PAGES)
console.log('got results')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const fzf = new Fzf(searchResults, {
  selector: (item) => item.name
})

let input = ''
let selection = ''
let matches = []
let position = 0
let newchar = false

process.stdin.on('keypress', (char, props) => {
  if (props.name === 'backspace') {
    input = input.substring(0, input.length - 1)
  }
  else if (props.name === 'return') {
    if (selection.length) {
      const videoUrl = fzf.find(selection)[0].item.value
      const videoPlayer = spawn(
        VIDEO_PLAYER,
        [
          videoUrl,
          '--fullscreen',
          '--loop',
          '--audio-pitch-correction=no'
        ],
        { detached: true, stdio: 'ignore' }
      )
      videoPlayer.unref()
      console.log(`opening url with ${VIDEO_PLAYER}: ${selection}`)
    }
    process.exit(0)
  } 
  else if (props.name === 'down' && matches[position + 1]) {
    position += 1
    selection = matches[position]
  }
  else if (props.name === 'up' && matches[position - 1]) {
    position -= 1
    selection = matches[position]
  }
  else if (char) {
    newchar = true
    input = input.concat(char)
  }

  if (newchar) {
    matches = fzf.find(input).map(match => match.item.name)
    selection = matches[0]
    newchar = false   
  }

  console.log('\x1b[0m\x1Bc\x1b[3J\x1b[?25l')
  if (matches[0]) console.log(matches.join('\n'))
  readline.cursorTo(process.stdout, 0, process.stdout.rows - 4)
  console.log(`input: ${input}`)
  console.log(`selection: ${selection}`)
  console.log('\x1b[?25h')
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
