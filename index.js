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

const searchTerm = process.argv.slice(2).join(' ')

// const prompt = new AutoComplete({
  // name: 'video',
  // message: 'select a video',
  // choices: async () => {

    // SHOULD PROBABLY THROW THIS IN A TRY CATCH.
    const results = await searchRecursive(searchTerm, MAX_PAGES)
    let choices = []
    for (let key in results) {
      choices = choices.concat(results[key])
    }
    
    // return choices
  // },
  
  // RE IMPLEMENT THIS WE STILL NEED IT.
  // limit: (process.stdout.rows - 4)

// })

/*

{
  sequence: '\x7F',
  name: 'backspace',
  ctrl: false,
  meta: false,
  shift: false
}

*/

let input=''

const rl = readline.createInterface({
  input: process.stdin,
  // WE SHOULD PROB NOT OUTPUT IT MAYBE.
  output: process.stdout
})

// KEEP ADDING IT ALL CHARS TO A STRING AND THEN RUN THAT STRING AGAINST CHOICES WITH FZF.
// https://fzf.netlify.app/docs/latest
// DO WE EVEN NEED FZF.
// https://nodejs.org/api/readline.html#use-of-the-completer-function_1
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
rl.input.on('keypress', (char, props) => {

  if (props.name === 'backspace') console.log('got backspace')
  // console.log(char)
  // console.log(props)
  // GET THE BACKSPACE KEY.
  // if (props.name === 'left' || props.name === 'right') {
    // readline.cursorTo(process.stdout, 0, process.stdout.rows - 2)
    // readline.clearLine(process.stdout, 0)
    // console.log(props.name.toUpperCase())
    // readline.cursorTo(process.stdout, 0, 0)
  // }
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
