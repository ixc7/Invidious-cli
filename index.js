import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, clear, mkInterface, mkTemp } from './util.js'
import downloadFile from './downloadFile.js'
import search from './search.js'

const runSearch = async (input, maxPages = 5) => {

  const promptUser = () => {
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

  const searchTerm = input || await promptUser()
  
  console.log(`searching for ${bold(searchTerm)}`)
  let res = await search(searchTerm, maxPages)

  if (!res.length) {
    console.log('no results')
    input = await promptUser()
    res = await runSearch(input, maxPages)
  }

  return res
}

const makeKeypressFunction = async (matchList, searchResultsList, destinationFolder, rl) => {
  let fzf = new Fzf(searchResultsList, { selector: item => item.title })
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
        const url = fzf.find(selection)[0].item.url
        const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')

        try {
          await downloadFile(selection, fileName, url, destinationFolder)
          process.exit(0)
        } catch (e) {
          rl.close()
          process.stdin.removeAllListeners('keypress')
          if (e) console.log('error downloading file', e)
          const newSearchResults = await runSearch()
          const newMatchList = newSearchResults.map(item => item.title)

          console.clear()
          // clear()
          cursorTo(process.stdout, 0, 1)
          console.log(
            newSearchResults
              .slice(0, process.stdout.rows - 9)
              .map(item => item.title)
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
    }
    else if (props.name === 'up') {
      render = true
      position -= 1
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

    // handle display
    // TODO thumbnails
    if (render) {
      render = false   
      const matchingItems = fzf.find(input).map(obj => obj.item.title)
      console.clear()
      // clear()
      
      if (position > matchingItems.length - 1) {
        position = 0
        selection = matchingItems[0] || false
      } 
      else if (position < 0) {
        position = matchingItems.length - 1
        selection = matchingItems[matchingItems.length - 1] || false
      }
      else {
        selection = matchingItems[position] || false
      } 

      if (matchingItems[0]) {
        const display = matchingItems
          .map((item, index) => {
            if (index === position) return bold(item) 
            return item
          })
          .slice(position)
          .slice(0, process.stdout.rows - 9)
          .join('\n')
          
        cursorTo(process.stdout, 0, 1)
        console.log(display)
      } 

      let foundInfo = false
      let info = {
        author: false,
        viewCount: false,
        publishedText: false,
        lengthSeconds: false
      }

      if (matchingItems[position]) foundInfo = fzf.find(matchingItems[position])
      if (foundInfo) info = foundInfo[0].item.info
      
      cursorTo(process.stdout, 0, process.stdout.rows - 7)
      process.stdout.write(`selection: ${selection ? (position + 1) + ' -' : ''} ${selection || 'none'}`)
        process.stdout.write(`\nauthor: ${info.author || ''}`)
        process.stdout.write(`\nviews: ${info.viewCount || ''}`)
        process.stdout.write(`\nadded: ${info.publishedText || ''}`)
        process.stdout.write(`\nlength: ${info.lengthSeconds || ''}\n`)
        process.stdout.write(input)
    }
  }

  console.clear()
  // clear()
  cursorTo(process.stdout, 0, 1)
  console.log(
    searchResultsList
      .slice(0, process.stdout.rows - 9)
      .map((item, index) => {
        if (index === 0) return bold(item.title)
        return item.title
      })
      .join('\n')
  )
  
  return uglyKeypressFunction
}

const userInput = process.argv.slice(2).join(' ') || false
const initialResults = await runSearch(userInput)
const initialMatches = initialResults.map(item => item.title)
const folder = mkTemp()
const initialRl = mkInterface()

let initialKeypressHandler = await makeKeypressFunction(initialMatches, initialResults, folder, initialRl)
initialRl.input.on('keypress', initialKeypressHandler)
