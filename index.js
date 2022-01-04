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

const prompt = new AutoComplete({
  name: 'video',
  message: 'select a video',
  choices: async () => {
    const results = await searchRecursive(searchTerm, MAX_PAGES)
    let choices = []
    for (let key in results) {
      choices = choices.concat(results[key])
    }
    return choices
  },
  limit: (process.stdout.rows - 4)
})

prompt.on('keypress', (char, props) => {
  readline.cursorTo(process.stdout, 0, process.stdout.rows - 2)
  readline.clearLine(process.stdout, 0)
  if (props.name === 'left' || props.name === 'right') console.log(props.name)
  readline.cursorTo(process.stdout, 0, 0)
})

try {
  console.clear()
  console.log(`searching for: ${searchTerm}`)
  const selection = await prompt.run()
  console.clear()
  console.log(`opening url with ${VIDEO_PLAYER}: ${selection}`)
  const videoPlayer = spawn(
    VIDEO_PLAYER,
    [selection, '--fullscreen', '--loop', '--audio-pitch-correction=no'],
    { detached: true, stdio: 'ignore' }
  )
  videoPlayer.unref()
  process.exit(0)
}

catch (e) {
  console.clear()
  console.log('exit')
  if (e) console.log(e)
  process.exit(0)
}
