import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, clear, mkInterface, mkTemp } from './util.js'
import downloadFile from './downloadFile.js'
import search from './search.js'


// TODO consolidate this and the search function call into one function?
const searchPrompt = ()  => {
  return new Promise((resolve, reject) => {
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
}

let searchTerm = process.argv.slice(2).join(' ') || await searchPrompt()
console.log(`searching for ${bold(searchTerm)}`)

let maxPages = 5
let initialResults = await search(searchTerm, maxPages)

if (!initialResults.length) {
  console.log('no results')
  process.exit(0)
}

const makeKeypressFunction = async (matchList, searchList, destinationFolder) => {
  let rl = mkInterface()
  let fzf = new Fzf(searchList, { selector: item => item.name })
  let input = ''
  let render = false
  let selection = false
  let position = 0

  const uglyKeypressFunction = async (char, props) => {

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

        try {
          await downloadFile(selection, fileName, url, destinationFolder)
          process.exit(0)
        } catch (e) {
          rl.close()
          process.stdin.removeAllListeners('keypress')


          if (e) console.log(e)
          
          const newSearchTerm = await searchPrompt()
          console.log(`searching for ${bold(newSearchTerm)}`)
          
          const newSearchResults = await search(newSearchTerm, maxPages)
          const newMatchList = newSearchResults.map(item => item.name)

          clear()
          cursorTo(process.stdout, 0, 23)
          console.log(
            newMatchList
              .slice(0, process.stdout.rows - 30)
              .map(item => item.name)
              .join('\n')
          )
          
          const newRl = mkInterface()
          const newKeypressHandler = await makeKeypressFunction(newMatchList, newSearchResults, destinationFolder)
          newRl.input.on('keypress', newKeypressHandler)
        }
      }
    }

    // else if (props.name === 'down' && matchList[position + 1]) {
    else if (props.name === 'down') {
      render = true
      position += 1
      selection = matchList[position]
    }

    // else if (props.name === 'up' && matchList[position - 1]) {
    else if (props.name === 'up') {
      render = true
      position -= 1
      selection = matchList[position]
    }
    
    else if (props.name === 'up' && matchList.length === 1 || props.name === 'down' && matchList.length === 1) {
      selection = matchList[0]
      cursorTo(process.stdout, 0, process.stdout.rows - 4)
      process.stdout.write(`selection: ${position + ': ' || ''} ${selection || 'none'}\ninput: ${input}`)
    }

    else if (char && !props.sequence.includes('\x1b')) {
      render = true
      input = input.concat(char)
    }

    // handle drawing the screen
    // TODO thumbnails

    if (render) {
      render = false   
      const matchingItems = fzf.find(input).map(obj => obj.item.name)
      clear()
      
      if (position > matchingItems.length - 1) {
        position = 0
        selection = matchingItems[0] || false
      } 

      else if (position < 0) {
        position = matchingItems.length - 1
        selection = matchingItems[matchingItems.length - 1] || false
      } 

      if (matchingItems[0]) {
        const display = matchingItems
          .map((item, index) => {
            if (index === position) return bold(item) 
            return item
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

  return uglyKeypressFunction

}

const folder = mkTemp()
const initialRl = mkInterface()
const initialMatches = initialResults.map(item => item.name)

// render the initial results
// TODO just have the first one selected by default.
clear()
cursorTo(process.stdout, 0, 23)
console.log(
  initialResults
    .slice(0, process.stdout.rows - 30)
    .map(item => item.name)
    .join('\n')
)


let initialKeypressHandler = await makeKeypressFunction(initialMatches, initialResults, folder)
initialRl.input.on('keypress', initialKeypressHandler)
