import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import downloadFile from './download.js'
import { bold, formatTime, noScroll } from './util.js'

const mkParser = async (searchResultsList, destinationFolder) => {
  const fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let selection = false
  let render = false
  let position = 0
  let input = ''

  const parser = async (char, props) => {
    // -- SUBMIT
    if (props.name === 'return' && selection) {
      const fileName = selection.title.replace(/([^a-z0-9]+)/gi, '-')
      await downloadFile(selection.title, fileName, selection.url, destinationFolder)
    }

    // -- MOVE AROUND
    render = true
    
    if (props.name === 'backspace') input = input.substring(0, input.length - 1)
    else if (props.name === 'down') position += 1
    else if (props.name === 'up') position -= 1
    else if (char && !props.sequence.includes('\x1b')) input += char

    // ---- RENDERER
    // TODO thumbnails
    if (render) {
      render = false
            
      const matchingItems = fzf.find(input).map(({item}, index) => {
        return {
          title: item.title,
          info: item.info,
          url: item.url,
          index
        }
      })

      if (position > matchingItems.length - 1) position = 0
      else if (position < 0) position = matchingItems.length - 1

      selection = matchingItems[position]

      noScroll()

      if (selection) {
        const { author, viewCount, publishedText, lengthSeconds } = selection.info
        
        cursorTo(process.stdout, 0, 0)
        process.stdout.write(
          `${bold(selection.title)}\n` +
          matchingItems
          .slice(position + 1, position + (process.stdout.rows - 9))
          .map(res => res.title)
          .join('\n')
        )

        cursorTo(process.stdout, 0, process.stdout.rows - 7)
        process.stdout.write(
        `
          \rselection: ${selection.title}
          \rauthor: ${author}
          \rviewCount: ${viewCount}
          \rPublishedText: ${publishedText}
          \rlengthSeconds: ${formatTime(lengthSeconds)}
        `)
      }

      cursorTo(process.stdout, 0, process.stdout.rows - 1)
      process.stdout.write(`-> ${input}`)
    }
  }

  // initial render
  // TODO duplicate
  noScroll()
  cursorTo(process.stdout, 0, 0)
  process.stdout.write(
    // `${bold(searchResultsList[0].title)}\n` +
    searchResultsList
    .slice(0, process.stdout.rows - 9)
    .map(res => res.title)
    .join('\n')
  )

  return parser
}

export default mkParser
