import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, clear, mkInterface, mkTemp } from './util.js'
import downloadFile from './downloadFile.js'
import search from './search.js'

const searchTerm = process.argv.slice(2).join(' ') || await new Promise((resolve, reject) => {
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

console.log(`searching for ${bold(searchTerm)}`)
const maxPages = 5
const results = await search(searchTerm, maxPages)

if (!results.length) {
  console.log('no results')
  process.exit(0)
}

let input = ''
let position = 0
let render = false
let selection = false
let matches = results.map(item => item.name)

const rl = mkInterface()
const fzf = new Fzf(results, { selector: item => item.name })
const tempDir = mkTemp()

const uglyKeypressFunction = (char, props) => {

  // handle keys

  if (props.name === 'backspace') {
    render = true
    input = input.substring(0, input.length - 1)
  }

  else if (props.name === 'return') {
    if (selection) {
      rl.close()
      process.stdin.removeAllListeners('keypress')
      const url = fzf.find(selection)[0].item.value
      const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')
      downloadFile(selection, fileName, url, tempDir)
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
    process.stdout.write(`selection: ${position + ': ' || ''} ${selection || 'none'}\ninput: ${input}`)
  }

  else if (char && !props.sequence.includes('\x1b')) {
    render = true
    input = input.concat(char)
  }

  // handle display

  // TODO thumbnails
  if (render) {
    render = false   
    matches = fzf.find(input).map(obj => obj.item.name)
    clear()
    
    if (position >= matches.length) {
      position = 0
      selection = matches[0] || false
    }

    if (matches[0]) {
      const display = matches        
        // TODO IMPORTANT this produces duplicate bold texts! FIX this
        .map((item, index) => {
          // if (item.includes(selection) && matches.indexOf(item) === position) return bold(item)
          // if (matches.indexOf(item) === position) {
          if (index === position) {
            return bold(item) 
          } else {
            return item
          }
        })
        .slice(position)
        .slice(0, process.stdout.rows - 30)
        .join('\n')
        
      // so the thumbnail is gonna be 22-23 high
      cursorTo(process.stdout, 0, 23)
      console.log(display)
    } 

    cursorTo(process.stdout, 0, process.stdout.rows - 4)
    process.stdout.write(`selection: ${selection ? (position + 1) + ' -' : ''} ${selection || 'none'}\ninput: ${input}`)
  }
}

// render the initial results
// TODO just have the first one selected by default.
const initialDisplay = results
  .slice(0, process.stdout.rows - 30)
  .map(item => item.name)
  .join('\n')

// clear(`\n${initialDisplay}`)
clear()
cursorTo(process.stdout, 0, 23)
console.log(initialDisplay)
rl.input.on('keypress', uglyKeypressFunction)
