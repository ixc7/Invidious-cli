import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import downloadFile from './download.js'
import { bold, formatTime, noScroll } from './util.js'

const mkParser = async (matchList, searchResultsList, destinationFolder, rl) => {
  const fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let input = ''
  let render = false
  let position = 0
  let selection = matchList[0]

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
    if (render) {
      noScroll()
      render = false

      const matchingItems = fzf.find(input).map(({item}) => {
        return {
          title: item.title,
          info: item.info,
          url: item.url
        }
      })

      if (position > matchingItems.length - 1) {
        position = 0
        selection = matchingItems[0]
      } else if (position < 0) {
        position = matchingItems.length - 1
        selection = matchingItems[matchingItems.length - 1]
      } else selection = matchingItems[position]

      // TODO thumbnails
      if (matchingItems[0]) {
        const display = matchingItems.map(
          (item, index) => {
            if (index === position) return bold(item.title)
            return item.title
          }
        )
        .slice(position)
        .slice(0, process.stdout.rows - 9)
        .join('\n')

        cursorTo(process.stdout, 0, 0)
        process.stdout.write(display)
      }

      if (matchingItems[position]) { 
        cursorTo(process.stdout, 0, process.stdout.rows - 7)
        const { author, viewCount, publishedText, lengthSeconds } = matchingItems[position].info
        process.stdout.write(`
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
  process.stdout.write(searchResultsList
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
