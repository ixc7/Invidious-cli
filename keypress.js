import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { downloadFile } from './download.js'
import { bold, mkPrompt, mkInterface } from './util.js'
import search from './search.js'
import options from './options.js'

const { repeat, pages } = options

const mkParser = async (matchList, searchResultsList, destinationFolder, rl) => {
  let fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let input = ''
  let render = false
  let position = 0
  let selection = matchList[0]

  // ---- PARSER
  const parser = async (char, props) => {

    // -- SUBMIT
    if (props.name === 'return') {
      if (selection) {
        render = false
        rl.close()
        process.stdin.removeAllListeners('keypress')

        const url = fzf.find(selection)[0].item.url
        const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')

        try {
          await downloadFile(selection, fileName, url, destinationFolder)
        } 
        catch (e) {
          rl.close()
          process.stdin.removeAllListeners('keypress')
          if (e) console.log('error downloading file\n', e)
        }

        if (!repeat) process.exit(0)
        
        let newSearchTerm = await mkPrompt()
        console.log(`searching for ${bold(newSearchTerm)}`)
        let newSearchResults = await search(newSearchTerm, pages)
        
        if (!newSearchResults.length) {
            console.log('no results')
            if (!repeat) process.exit(0)
            newSearchTerm = await mkPrompt()
            newSearchResults = await search(newSearchTerm, pages)
        }
        
        const newMatchList = newSearchResults.map(m => m.title)
        
        console.clear()
        cursorTo(process.stdout, 0, 1)
        console.log(newSearchResults
          .slice(0, process.stdout.rows - 9)
          .map(item => item.title)
          .join('\n')
        )
      
        const newRl = mkInterface()
        const newParser = await mkParser(newMatchList, newSearchResults, destinationFolder, newRl)
        newRl.input.on('keypress', newParser)
      }
    }
    // -- MOVE AROUND
    else if (props.name === 'backspace') {
      render = true
      input = input.substring(0, input.length - 1)
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
    // --

    // ---- RENDERER
    if (render) {
      render = false   
      const matchingItems = fzf.find(input).map(obj => obj.item.title)
      console.clear()
      
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

      // TODO thumbnails
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

      // TODO
      cursorTo(process.stdout, 0, process.stdout.rows - 7)
      process.stdout.write(`
      \rselection: ${selection ? (position + 1) + ' -' : ''} ${selection || 'none'}
      \rauthor: ${info.author || ''}
      \rviews: ${info.viewCount || ''}
      \radded: ${info.publishedText || ''}
      \rlength: ${info.lengthSeconds || ''}
      \r${input}`)
    }
  }
  // --

  // initial render
  console.clear()
  cursorTo(process.stdout, 0, 1)
  console.log(searchResultsList
    .slice(0, process.stdout.rows - 9)
    .map((item, index) => {
      if (index === 0) return bold(item.title)
      return item.title
    })
    .join('\n')
  )

  return parser
}

export default mkParser
