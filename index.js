import { createInterface, cursorTo } from 'readline'
import { rmSync } from 'fs'
import { spawn, spawnSync } from 'child_process'
import { Fzf } from 'fzf'
import search from './search.js'

const VIDEO_DOWNLOADER = 'yt-dlp'
const VIDEO_PLAYER = 'mpv'
const FILE_FORMAT = 'm4a'
const MAX_PAGES = 2

const clear = () => process.stdout.write('\x1b[?25h\x1b[0m\x1Bc\x1b[3J')
const bold = input => `\x1b[1m${input}\x1b[0m`

const mkInterface = (opts = {}) => {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
    ...opts
  })
}

const userInput = process.argv.slice(2).join(' ') || await new Promise((resolve, reject) => {
  const rl = mkInterface({ prompt: 'search: ' }) 
  rl.on('line', line => {
    if (line.split('').filter(i => i !== ' ').length > 0) {
      rl.close()
      resolve(line)
    }
    rl.prompt()
  })
  rl.prompt()
})

console.log(`searching for ${bold(userInput)}`)
const results = await search(userInput, MAX_PAGES)

if (!results.length) {
  console.log('no results')
  process.exit(0)
}

clear()
console.log(
  results
  .slice(0, process.stdout.rows - 5)
  .map(item => item.name)
  .join('\n')
)

const rl = mkInterface()
const fzf = new Fzf(results, { selector: item => item.name })

let input = ''
let position = 0
let render = false
let selection = false
let matches = results.map(item => item.name)

const playFile = (filePath, application) => {
  console.log(`playing file with ${bold(application)}\npress ${bold('q')} to quit\n`)

  const player = spawn(
    application,
    [filePath, '--audio-pitch-correction=no', '--loop'],
    { stdio: ['pipe', process.stdout, process.stderr] }
  )

  player.on('exit', code => {
    if (code !== 0) console.log(`error opening file: got exit code ${bold(code)}\n`)
    rmSync(filePath, { force: true })
    process.exit(0)
  })

  process.stdin.pipe(player.stdin)

  process.stdin.on('keypress', (char, props) => {
    if (char === 'q')  {
      player.kill()
      rmSync(filePath, { force: true })
      process.exit(0)
    }
  })
}

const downloadFile = (selection, file, url, application) => {
  clear()
  console.log(`\nvideo: ${bold(selection)}\nurl: ${bold(url)}\n\ndownloading file with ${bold(application)}\npress ${bold('q')} to cancel\n`)

  const format = FILE_FORMAT
  const directory = spawnSync('mktemp', ['-d']).stdout.toString('utf8').split('\n').join('')
  const filePath = `${directory}/${file}.${format}` 

  const downloader = spawn(
    application,
    [
      `--format=${format}`,
      '--quiet',
      '--progress',
      `--output=${filePath}`,
      url
    ],
    {
      stdio: ['pipe', process.stdout, process.stderr]
    }
  )

  const rl = mkInterface()

  rl.input.on('keypress', (char, props) => {
    if (char === 'q')  {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      downloader.kill()
      rmSync(`${filePath}.part`, { force: true })
      console.log('\ndownload cancelled\n')
      process.exit(0)
    }
  })  

  downloader.on('exit', code => {
    if (code !== 0) {
      console.log(`error downloading file: got exit code ${bold(code)}\n`)
      process.exit(0)
    } else {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      playFile(filePath, VIDEO_PLAYER)
    }
  })
}

// TODO fix this
const uglyKeypressFunction = (char, props) => {
  if (props.name === 'backspace') {
    render = true
    input = input.substring(0, input.length - 1)
  }
  else if (props.name === 'return') {
    if (selection) {
        const url = fzf.find(selection)[0].item.value
        const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')
        rl.close()
        process.stdin.removeAllListeners('keypress')
        downloadFile(selection, fileName, url, VIDEO_DOWNLOADER)
    }
  }
  else if (props.name === 'down' && matches[position + 1]) {
    render = true
    position += 1
    selection = matches[position]
  }
  else if (props.name === 'up' && matches[position - 1]) {
    render = true
    position -= 1
    selection = matches[position]
  }
  else if (props.name === 'up' && matches.length === 1 || props.name === 'down' && matches.length === 1) {
    selection = matches[0]
    cursorTo(process.stdout, 0, process.stdout.rows - 4)
    console.log(`selection: ${selection || none}\ninput: ${input || none}`)
  }
  else if (char && !props.sequence.includes('\x1b')) {
    render = true
    input = input.concat(char)
  }

  if (render) {
    render = false   
    matches = fzf.find(input).map(obj => obj.item.name)
    clear()
    
    if (position >= matches.length) {
      position = 0
      selection = matches[0] || false
    }

    if (matches[0]) console.log(
      matches
      .slice(0, process.stdout.rows - 5)
      .map(item => {
        // TODO fix this
        if (item === selection) return bold(item)
        return item
      })
      .join('\n')
    )

    cursorTo(process.stdout, 0, process.stdout.rows - 4)
    process.stdout.write(`selection: ${selection || 'none'}\ninput: ${input}`)
  }
}

rl.input.on('keypress', uglyKeypressFunction)
