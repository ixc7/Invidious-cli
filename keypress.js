// the main UI function.
import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, fmtTime, sanitize } from './util.js'
import { download } from './download.js'

const print = (str, x = 0, y = 0) => {
  cursorTo(process.stdout, x, y)
  process.stdout.write(str)
}

const getRows = n => process.stdout.rows - n

export const keypressHandle = async (searchResults, destinationFolder) => {
  let pos = Infinity
  let selection = false
  let input = ''

  const fzf = new Fzf(searchResults, { selector: item => item.title || '' })

  const keymap = {
    up: () => { pos -= 1 },
    down: () => { pos += 1 },
    left: () => { pos -= 1 },
    right: () => { pos += 1 },
    return: async () => selection
      ? await download(selection.title, sanitize(selection.title), selection.url, destinationFolder)
      : null,
    backspace: () => { input = input.substring(0, input.length - 1) },
    q: seq => {
      if (seq === '\x11') { // ctrl-q
        console.clear()
        console.log('search cancelled')
        process.exit(0)
      }
      input += 'q' // q
    }
  }

  // main function
  const keypressRender = async (char, { name, sequence }) => {
    // check if keypress has an action
    if (keymap[name]) await keymap[name](sequence)

    // else, type the character into query input (default)
    else if (char && !sequence.includes('\x1b') && name !== 'return') input += char

    // get list of query input matches
    const matches = fzf.find(input).map(({ item }) => item)
    const len = matches.length - 1

    // highlight correct position
    // TODO use ternary &&s like in React? or no.
    if (pos > len) pos = 0
    else if (pos < 0) pos = len
    selection = matches[pos]

    // render/print everything
    console.clear()

    if (selection) {
      const { author, viewCount, publishedText, lengthSeconds } = selection.info

      print(
        `${bold(selection.title)}\n` +
        matches
          .slice(pos + 1, pos + getRows(9))
          .map(res => res.title)
          .join('\n')
      )

      print(`
        \rselection: ${selection.title}
        \rauthor: ${author}
        \rviewCount: ${viewCount}
        \rPublishedText: ${publishedText}
        \rlengthSeconds: ${fmtTime(lengthSeconds)}
      `, 0, getRows(7)
      )
    }

    // render fzf query input at bottom
    print(`-> ${input}`, 0, getRows(1))
  }

  // initial render (same format as above)
  console.clear()

  print(
    '...\n' +
    searchResults
      .slice(0, getRows(10))
      .map(res => res.title)
      .join('\n')
  )

  print(`-> ${input}`, 0, getRows(1))

  return keypressRender
}
