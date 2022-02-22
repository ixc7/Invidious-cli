import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import downloadFile from './download.js'
import { bold, formatTime, noScroll } from './util.js'

const draw = (content, x = 0, y = 0)  => {
  cursorTo(process.stdout, x, y)
  process.stdout.write(content) // , 'utf8'
}

const mkParser = async (searchResultsList, destinationFolder) => {
  const fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let selection = false
  let render = false
  let position = 0
  let input = ''

  const keypressParser = async (char, props) => {
    // -- SUBMIT
    if (props.name === 'return' && selection) {
      const fileName = selection.title.replace(/([^a-z0-9]+)/gi, '-')
      await downloadFile(selection.title, fileName, selection.url, destinationFolder)
    }

    // -- MOVE AROUND FLAG
    render = true
    
    if (props.name === 'backspace') input = input.substring(0, input.length - 1)
    else if (props.name === 'down') position += 1
    else if (props.name === 'up') position -= 1
    else if (char && !props.sequence.includes('\x1b')) input += char

    // ---- DRAW SCREEN
    // TODO thumbnails
    if (render) {
      render = false

      const matchingItems = fzf.find(input).map(({item}) => {
        return {
          title: item.title,
          info: item.info,
          url: item.url
        }
      })

      if (position > matchingItems.length - 1) position = 0
      else if (position < 0) position = matchingItems.length - 1

      selection = matchingItems[position]
      noScroll()

      if (selection) {
        const { author, viewCount, publishedText, lengthSeconds } = selection.info

        draw(
          `${bold(selection.title)}\n` +
          matchingItems
          .slice(position + 1, position + (process.stdout.rows - 9))
          .map(res => res.title)
          .join('\n')
        )

        draw(`
          \rselection: ${selection.title}
          \rauthor: ${author}
          \rviewCount: ${viewCount}
          \rPublishedText: ${publishedText}
          \rlengthSeconds: ${formatTime(lengthSeconds)}
        `, 0, process.stdout.rows - 7)
      }

      draw(`-> ${input}`, 0, process.stdout.rows - 1)
    }
  }

  // initial
  noScroll()
  draw(
    `${bold(searchResultsList[0].title)}\n` +
    searchResultsList
    .slice(1, process.stdout.rows - 9)
    .map(res => res.title)
    .join('\n')
  )

  return keypressParser
}

export default mkParser
