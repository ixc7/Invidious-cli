import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, formatTime, noScroll } from './util.js'
import downloadFile from './download.js'

export const keypressHandle = async (searchResultsList, destinationFolder) => {
  const draw = (content, x = 0, y = 0) => {
    cursorTo(process.stdout, x, y)
    process.stdout.write(content) // , 'utf8'
  }
  const fzf = new Fzf(searchResultsList, { selector: item => item.title })
  let selection = false
  let render = false
  let position = 0
  let input = ''

  const keypressParse = async (char, { name, sequence }) => {
    // -- SUBMIT
    if (name === 'return' && selection) {
      const fileName = selection.title.replace(/([^a-z0-9]+)/gi, '-')
      await downloadFile(
        selection.title,
        fileName,
        selection.url,
        destinationFolder
      )
    }

    // ---- DRAW SCREEN
    render = true

    if (name === 'backspace') input = input.substring(0, input.length - 1)
    else if (name === 'down' || name === 'right') position += 1
    else if (name === 'up' || name === 'left') position -= 1
    else if (char && !sequence.includes('\x1b') && name !== 'return') {
      input += char
    }

    // TODO thumbnails
    if (render) {
      render = false
      const matchingItems = fzf.find(input).map(({ item }) => item)
      const len = matchingItems.length - 1

      if (position > len) position = 0
      else if (position < 0) position = len

      selection = matchingItems[position]
      noScroll()

      if (selection) {
        const { author, viewCount, publishedText, lengthSeconds } =
          selection.info

        draw(
          `${bold(selection.title)}\n` +
            matchingItems
              .slice(position + 1, position + (process.stdout.rows - 9))
              .map(res => res.title)
              .join('\n')
        )
        draw(
          `
          \rselection: ${selection.title}
          \rauthor: ${author}
          \rviewCount: ${viewCount}
          \rPublishedText: ${publishedText}
          \rlengthSeconds: ${formatTime(lengthSeconds)}
        `,
          0,
          process.stdout.rows - 7
        )
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
  draw(`-> ${input}`, 0, process.stdout.rows - 1)

  return keypressParse
}

export default keypressHandle
