import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, formatTime, noScroll, sanitize } from './util.js'
import { download } from './download.js'

// the main UI function.
export const keypressHandle = async (searchResultsList, destinationFolder) => {
  let position = Infinity
  let selection = false
  let input = ''

  // fzf instance
  const fzf = new Fzf(searchResultsList, { selector: item => item.title || '' })

  // render function
  const draw = (content, x = 0, y = 0) => {
    cursorTo(process.stdout, x, y)
    process.stdout.write(content)
  }

  // actions for each key combination
  const keymap = {
    down: () => { position += 1 },
    right: () => { position += 1 },
    up: () => { position -= 1 },
    left: () => { position -= 1 },
    return: async () => {
      if (selection) {
        return await download(
          selection.title,
          sanitize(selection.title),
          selection.url,
          destinationFolder
        )
      }
    },
    backspace: () => { input = input.substring(0, input.length - 1) },
    q: sequence => {
      // ctrl-q
      if (sequence === '\x11') {
        noScroll()
        console.log('search cancelled')
        process.exit(0)
      }
      input += 'q'
    }
  }

  // main function/handler
  const keypressRender = async (char, { name, sequence }) => {
    // check if has an action
    if (keymap[name]) await keymap[name](sequence)

    // else, type the character into query input (default)
    else if (char && !sequence.includes('\x1b') && name !== 'return') input += char

    // get list of query input matches
    const matches = fzf.find(input).map(({ item }) => item)
    const len = matches.length - 1

    // highlight correct position
    if (position > len) position = 0
    else if (position < 0) position = len
    selection = matches[position]

    // clear + render selection info
    noScroll()
    if (selection) {
      const { author, viewCount, publishedText, lengthSeconds } = selection.info
      draw(
        `${bold(selection.title)}\n` +
          matches
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

    // render query input
    draw(`-> ${input}`, 0, process.stdout.rows - 1)
  }

  // initial render (same format as above)
  noScroll()
  draw(
    '...\n' +
      searchResultsList
        .slice(0, process.stdout.rows - 10)
        .map(res => res.title)
        .join('\n')
  )
  draw(`-> ${input}`, 0, process.stdout.rows - 1)

  return keypressRender
}
