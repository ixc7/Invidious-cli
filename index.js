import readline from 'readline'
import { spawn } from 'child_process'
// import enquirer from 'enquirer'
import { searchRecursive } from './search.js'

// const { AutoComplete } = enquirer
const VIDEO_PLAYER = 'mpv'
const MAX_PAGES = 3

if (!process.argv[2]) {
  console.log('please enter a search term')
  process.exit(0)
}

const searchTerm = process.argv.slice(2).join(' ')

console.clear()
console.log('searching')
const searchResults = await searchRecursive(searchTerm, MAX_PAGES)
console.clear()
console.log('got results')
console.log(searchResults)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// limit: (process.stdout.rows - 4)
// RE IMPLEMENT THIS WE STILL NEED IT.

// KEEP ADDING IT ALL CHARS TO A STRING AND THEN RUN THAT STRING AGAINST CHOICES WITH FZF.
// https://fzf.netlify.app/docs/latest
// DO WE EVEN NEED FZF.
// https://nodejs.org/api/readline.html#use-of-the-completer-function_1
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

let input=''
// ONLY PROBLEM IS IT DOESN'T SEARCH OUT OF ORDER.
// SO YEAH I GUESS WE DO NEED FZF.
process.stdin.on('keypress', (char, props) => {
  console.clear()
  readline.cursorTo(process.stdout, 0, 1)
  if (props.name === 'backspace') {
    input = input.substring(0, input.length - 1)
  } else if (props.name !== 'return'){
    input = input.concat(char)
  }
  for (let i = 0; i < searchResults.length; i += 1) {
    if (searchResults[i].name.toUpperCase().indexOf(input.toUpperCase()) !== -1) console.log(searchResults[i].name)
  }
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearLine(process.stdout, 0)
  console.log(input)
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
