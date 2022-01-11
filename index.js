import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, clear, mkInterface, mkTemp } from './util.js'
import downloadFile from './downloadFile.js'
import search from './search.js'


const runSearch = async (input, maxPages = 5) => {
  const searchPrompt = () => {
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

  const searchTerm = input || await searchPrompt()

  console.log(`searching for ${bold(searchTerm)}`)
  let res = await search(searchTerm, maxPages)

  if (!res.length) {
    console.log('no results')
    input = await searchPrompt()
    res = await runSearch(input, maxPages)
  }

  return res
}

let userInput = process.argv.slice(2).join(' ') || false
const initialResults = await runSearch(userInput)

const makeKeypressFunction = async (matchList, searchResultsList, destinationFolder, rl) => {
  // let rl = mkInterface()
  let fzf = new Fzf(searchResultsList, { selector: item => item.name })
  let input = ''
  let render = false
  let position = 0
  let selection = matchList[0]
  
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
          if (e) console.log('error downloading file', e)
          // position = 0
          const newSearchResults = await runSearch()
          const newMatchList = newSearchResults.map(item => item.name)

          clear()
          cursorTo(process.stdout, 0, 23)
          console.log(
            newSearchResults
              .slice(0, process.stdout.rows - 30)
              .map(item => item.name)
              .join('\n')
          )
        
          const newRl = mkInterface()
          const newKeypressHandler = await makeKeypressFunction(newMatchList, newSearchResults, destinationFolder, newRl)
          newRl.input.on('keypress', newKeypressHandler)
        }
      }
    }
    else if (props.name === 'down') {
      render = true
      position += 1
      // selection = matchList[position] || false
    }
    else if (props.name === 'up') {
      render = true
      position -= 1
      // selection = matchList[position] || false
    }
    else if (char && !props.sequence.includes('\x1b')) {
      render = true
      input = input.concat(char)
    }

   else if (matchList.length === 1 && (props.name === 'up' || props.name === 'down')) {
      render = true
      position = 0
      selection = matchList[0]
    }

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

      else {
        selection = matchList[position] || false
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
          
        cursorTo(process.stdout, 0, 23)
        console.log(display)
      } 

      cursorTo(process.stdout, 0, process.stdout.rows - 4)
      process.stdout.write(
        `selection: ${selection ? (position + 1) + ' -' : ''} ${selection || 'none'}\ninput: ${input}`
      )
    }
  }

  clear()
  cursorTo(process.stdout, 0, 23)
  console.log(
    searchResultsList
      .slice(0, process.stdout.rows - 30)
      .map((item, index) => {
        if (index === 0) return bold(item.name)
        return item.name
      })
      .join('\n')
  )
  
  return uglyKeypressFunction
}

const folder = mkTemp()
const initialRl = mkInterface()
const initialMatches = initialResults.map(item => item.name)

let initialKeypressHandler = await makeKeypressFunction(initialMatches, initialResults, folder, initialRl)
initialRl.input.on('keypress', initialKeypressHandler)
