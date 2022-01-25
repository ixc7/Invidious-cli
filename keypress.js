import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import downloadFile from './download.js'
import { bold, mkPrompt, mkInterface } from './util.js'
import search from './search.js'
import config from './config.js'

const { repeat, pages } = config

const mkParser = async (matchList, searchResultsList, destinationFolder, rl) => {
  let fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let input = ''
  let render = false
  let position = 0
  let selection = matchList[0]

  const parser = async (char, props) => {

    // -- SUBMIT
    if (props.name === 'return' && selection) {
      const url = fzf.find(selection)[0].item.url
      const fileName = selection.replace(/([^a-z0-9]+)/gi, '-')
      try {
        await downloadFile(selection, fileName, url, destinationFolder)
      } 
      catch {
        process.exit(0)
      }
    }

    // -- MOVE AROUND
    render = true

    if (props.name === 'backspace') input = input.substring(0, input.length - 1)
    else if (props.name === 'down') position += 1
    else if (props.name === 'up') position -= 1
    else if (char && !props.sequence.includes('\x1b')) input = input.concat(char)

    // ---- RENDERER
    if (render) {
      console.clear()
      render = false   

      const matchingItems = fzf.find(input).map(obj => obj.item.title)
      
      if (position > matchingItems.length - 1) {
        position = 0
        selection = matchingItems[0] || false
      } 
      else if (position < 0) {
        position = matchingItems.length - 1
        selection = matchingItems[matchingItems.length - 1] || false
      }
      else selection = matchingItems[position] || false

      // TODO thumbnails
      if (matchingItems[0]) {
        const display = matchingItems.map(
          (item, index) => {
            if (index === position) return bold(item) 
            return item
          }
        )
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

      // TODO make this good
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

  // initial render
  console.clear()
  cursorTo(process.stdout, 0, 1)
  console.log(searchResultsList
    .slice(0, process.stdout.rows - 9)
    .map(
      (item, index) => {
        if (index === 0) return bold(item.title)
        return item.title
      }
    )
    .join('\n')
  )

  return parser
}

export default mkParser
