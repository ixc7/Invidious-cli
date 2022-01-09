import readline from 'readline'
import { rmSync } from 'fs'
import { exec, spawn } from 'child_process'
import { Fzf } from 'fzf'
import searchRecursive from './search.js'

if (!process.argv[2]) {
  console.log('please enter a search term')
  process.exit(0)
}

const searchTerm = process.argv.slice(2).join(' ')
const VIDEO_DOWNLOADER = 'yt-dlp'
const VIDEO_PLAYER = 'mpv'
const MAX_PAGES = 3

console.log(`searching for ${searchTerm}`)
const searchResults = await searchRecursive(searchTerm, MAX_PAGES)

if (!searchResults.length) {
  console.log('no results')
  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const fzf = new Fzf(searchResults, {
  selector: item => item.name
})

let input = ''
let position = 0
let newchar = false
let selection = false
let matches = searchResults.map(item => item.name)

console.clear()
console.log(
  searchResults
  .slice(0, process.stdout.rows - 5)
  .map(item => item.name)
  .join('\n')
)

const runVideoPlayer = (fileName, player) => {
  console.log(`\n\nopening file with \x1b[1m${player}\x1b[0m\npress q to quit\n`)

  const videoPlayer = spawn(
    `${player}`,
    [`${fileName}.mp3`],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  process.stdin.pipe(videoPlayer.stdin)

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      rmSync(`${fileName}.mp3`, { force: true })
      process.exit(0)
    }
  })

  videoPlayer.on('exit', code => {
    if (code !== 0) console.log(`\x1b[1merror opening file: got exit code ${code}\x1b[0m\n`)
    rmSync(`${fileName}.mp3`, { force: true })
    process.exit(0)
  })
}

const runDownloader = (selection, fileName, videoUrl, videoDownloader) => {
  console.clear()
  console.log(`\nvideo: \x1b[1m${selection}\x1b[0m\nurl: \x1b[1m${videoUrl}\x1b[0m\n\ndownloading file with \x1b[1m${videoDownloader}\x1b[0m\npress q to cancel\n`)

  const quitListener = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      quitListener.close()
      process.stdin.removeAllListeners('keypress')
      rmSync(`${fileName}.mp3.part`, { force: true })
      console.log('\ndownload cancelled\n')
      process.exit(0)
    }
  })
  
  const downloader = exec(`${videoDownloader} --extract-audio --audio-format mp3 --audio-quality 0 --output "${fileName}.mp3" --quiet --progress "${videoUrl}"`)
  downloader.stdout.pipe(process.stdout)
  
  downloader.on('exit', code => {
    if (code !== 0) {
      console.log(`\x1b[1merror downloading file: got exit code ${code}\x1b[0m\n`)
      process.exit(0)
    } else {
      quitListener.close()
      process.stdin.removeAllListeners('keypress')
      runVideoPlayer(fileName, VIDEO_PLAYER)
    }
  })
}

const handleKeypress = (char, props) => {
  if (props.name === 'backspace') {
    newchar = true
    input = input.substring(0, input.length - 1)
  }
  else if (props.name === 'return') {
    if (selection) {
        const videoUrl = fzf.find(selection)[0].item.value
        const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')

        rl.close()
        process.stdin.removeAllListeners('keypress')
        runDownloader(selection, fileName, videoUrl, VIDEO_DOWNLOADER)
    }
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
  }
  else if (props.name === 'up' && matches.length === 1 || props.name === 'down' && matches.length === 1) {
    selection = matches[0]
    readline.cursorTo(process.stdout, 0, process.stdout.rows - 4)
    console.log(`selection: ${selection || none}\ninput: ${input || none}`)
  }
  else if (char && !props.sequence.includes('\x1b')) {
    newchar = true
    input = input.concat(char)
  }

  if (newchar) {
    newchar = false   
    matches = fzf.find(input).map(obj => obj.item.name)
    console.clear()

    if (position >= matches.length) {
      position = 0
      selection = matches[0] || false
    }

    if (matches[0]) console.log(
      matches
      .slice(0, process.stdout.rows - 5)
      .map(item => {
        if (item === selection) return `\x1b[1m${item}\x1b[0m`
        return item
      })
      .join('\n')
    )

    readline.cursorTo(process.stdout, 0, process.stdout.rows - 4)
    process.stdout.write(`selection: ${selection || 'none'}\ninput: ${input}`)
  }
}

rl.input.on('keypress', handleKeypress)
