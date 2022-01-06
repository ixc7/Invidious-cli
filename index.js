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

if (!searchResults.length) {
  console.log('no results')
  process.exit(0)
}

console.clear()
console.log(searchResults.map(item => item.name).join('\n'))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const fzf = new Fzf(searchResults, {
  selector: (item) => item.name
})

let input = ''
let selection = false
let matches = searchResults.map(item => item.name)
let position = 0
let newchar = false
process.stdin.on('keypress', (char, props) => {
  if (props.name === 'backspace') {
    newchar = true
    input = input.substring(0, input.length - 1)
  }
  else if (props.name === 'return') {
    if (selection) {
      const videoUrl = fzf.find(selection)[0].item.value
      const videoPlayer = spawn(
        VIDEO_PLAYER,
        [
          videoUrl,
          '--loop',
          '--audio-pitch-correction=no'
        ],
        { detached: true, stdio: 'ignore' }
      )
      videoPlayer.unref()
      console.log(`opening url with ${VIDEO_PLAYER}\nvideo: ${selection}\nurl: ${videoUrl}`)
    }
    process.exit(0)
  } 
  else if (props.name === 'down' && matches[position + 1]) {
    newchar = true
    position += 1
    selection = matches[position]
    
  }
  else if (props.name === 'up' && matches[position - 1]) {
    newchar = true
    position -= 1
    selection = matches[position]
    // readline.cursorTo(process.stdout, 0, process.stdout.rows - 4)
    // console.log(`selection: ${selection || 'none'}`)
  }
  else if (props.name === 'up' && matches.length === 1 || props.name === 'down' && matches.length === 1) {
    selection = matches[0]
    readline.cursorTo(process.stdout, 0, process.stdout.rows - 3)
    console.log(`selection: ${selection || none}\ninput: ${input}`)
  }
  else if (char && !props.sequence.includes('\x1b')) {
    newchar = true
    input = input.concat(char)
  }

  if (newchar) {
    matches = fzf.find(input).map(obj => obj.item.name)
    // selection = matches[0] || false
    // position = 0
    if (position >= matches.length) {
      position = 0
      selection = matches[0] || false
    }
    
    newchar = false   

    console.clear()
    if (matches[0]) console.log(matches.join('\n'))
    readline.cursorTo(process.stdout, 0, process.stdout.rows - 3)
    process.stdout.write(`selection: ${selection || 'none'}\ninput: ${input}`)
    // console.log(`input: ${input}`)
  }
})
