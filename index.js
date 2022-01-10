import { createInterface, cursorTo } from 'readline'
import { spawn, spawnSync } from 'child_process'
import { rmSync } from 'fs'
import { Fzf } from 'fzf'
import { bold, clear, mkInterface } from './util.js'
import downloadFile from './downloadFile.js'
import search from './search.js'

const maxPages = 5

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
        downloadFile(selection, fileName, url)
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

  // TODO images
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
        .slice(position)
        .slice(0, process.stdout.rows - 7)
        .map(item => {
          if (item === selection) return bold(item)
          return item
        })
        .join('\n')
      console.log(`\n${display}`)
    } 

    cursorTo(process.stdout, 0, process.stdout.rows - 4)
    process.stdout.write(`selection: ${selection ? (position + 1) + ' -' : ''} ${selection || 'none'}\ninput: ${input}`)
  }
}


// render the initial results
// TODO just have the first one selected by default.
const initialDisplay = results
  .slice(0, process.stdout.rows - 7)
  .map(item => item.name)
  .join('\n')
clear(`\n${initialDisplay}`)

rl.input.on('keypress', uglyKeypressFunction)
