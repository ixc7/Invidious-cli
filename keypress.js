import { cursorTo } from 'readline'
import { clear } from 'console'
import { Fzf } from 'fzf'
import { bold, fmtTime, sanitize } from './util.js'
import { download } from './download.js'

/* utils */

const write = (str, x = 0, y = 0) => {
  cursorTo(process.stdout, x, y)
  process.stdout.write(str)
}

const getRows = n => process.stdout.rows - n

/* wrapper */

export const mainKeypressHandler = async (searchResults, destinationFolder) => {
  let pos = Infinity
  let selection = false
  let input = ''

  const keymap = {
    'up': () => pos -= 1,
    'down': () => pos += 1,
    'left': () => pos -= 1,
    'right': () => pos += 1,
    'return': async () => selection
      ? await download(selection.title, sanitize(selection.title), selection.url, destinationFolder)
      : null,
    'backspace': () => input = input.substring(0, input.length - 1),
    'q': seq => {
      if (seq === '\x11') { // ctrl+q
        clear()
        write('search cancelled\n')
        process.exit(0)
      }
      input += 'q' // normal q
    }
  }

  const fzf = new Fzf(searchResults, { selector: item => item.title || '' })

  /* main function

    checks for/runs keymap functions,
    filters input w fzf,
    draws the ui */

  const keypressRender = async (char, { name, sequence }) => {
    // check if keypress has an action
    if (keymap[name]) await keymap[name](sequence)

    // else, add char to input
    else if (char && !sequence.includes('\x1b') && name !== 'return') input += char

    // get list of input matches
    const matches = fzf.find(input).map(({ item }) => item)
    const len = matches.length - 1

    // infinite scroll up/down
    if (pos > len) pos = 0
    else if (pos < 0) pos = len

    // highlight current selection
    selection = matches[pos]

    // render the ui
    clear()

    if (selection) {
      const { author, viewCount, publishedText, lengthSeconds } = selection.info

      // list of video titles
      write(
        `${bold(selection.title)}\n` +
        matches
          .slice(pos + 1, pos + getRows(9))
          .map(res => res.title)
          .join('\n')
      )

      // info box
      write(`
        \rTitle: ${selection.title}
        \rChannel: ${author}
        \rViews: ${viewCount}
        \rDescription: ${publishedText}
        \rLength: ${fmtTime(lengthSeconds)}
      `, 0, getRows(7)
      )
    }

    // fzf input at bottom
    write(`-> ${input}`, 0, getRows(1))
  }

  // initial render (same as above)
  clear()

  write(
    '...\n' +
    searchResults
      .slice(0, getRows(10))
      .map(res => res.title)
      .join('\n')
  )
  write(`-> ${input}`, 0, getRows(1))

  // return the main function
  return keypressRender
}
