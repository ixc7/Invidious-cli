import { spawnSync } from 'child_process'
import { Fzf } from 'fzf'
import { bold, fmtTime, sanitize, getRows, write, clear } from './util.js'
import { download } from './download.js'

// top wrapper
export const mainUI = async (searchResults, destinationFolder) => {
  let pos = Infinity
  let selection = false
  let input = ''

  // keymap
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
      // ctrl+q
      if (seq === '\x11') {
        clear()
        write('search cancelled\n')
        process.exit(0)
      }
      // normal q
      input += 'q'
    }
  }

  // fuzzy finder instance
  const fzf = new Fzf(searchResults, { selector: item => item.title || '' })

  // main UI function
  const renderUI = async (char, { name, sequence }) => {
    // check if keypress has an associated action
    if (keymap[name]) await keymap[name](sequence)

    // else, add keypress character to input
    else if (char && !sequence.includes('\x1b') && name !== 'return') input += char

    // get list of fuzzy matches to input
    const matches = fzf.find(input).map(({ item }) => item)
    const len = matches.length - 1

    // infinite scroll up/down
    if (pos > len) pos = 0
    else if (pos < 0) pos = len

    // used to highlight + get info on current selection
    selection = matches[pos]

    // clear previous render
    clear()

    // render info about current selection
    if (selection) {
      const { title } = selection
      const { author, viewCount, publishedText, lengthSeconds, thumbnail } = selection.info

      // render thumbnail on ctrl+left/home key
      // not in top level keymap because needs selection
      if (name === 'home') {
        write(`Thumbnail: ${bold(title)}\n`)
        spawnSync(
          'timg',
          ['-gx10', thumbnail],
          { stdio: ['pipe', process.stdout, process.stderr] }
        )
      }

      // browsable list of video titles
      write(
        `${bold(title)}\n` +
        matches
          .slice(pos + 1, pos + getRows(19)) // 9 for info, 10 for timg
          .map(res => res.title)
          .join('\n'),
        0,
        16
      )

      // bottom info box
      write(`
        \rTitle: ${selection.title}
        \rItem: ${pos + 1} / ${matches.length}
        \rChannel: ${author}
        \rViews: ${viewCount}
        \rPublished: ${publishedText}
        \rLength: ${fmtTime(lengthSeconds)}
      `, 0, getRows(8)
      )
    }

    // bottom input line
    write(`-> ${input}`, 0, getRows(1))
  }

  // initial render (same as above)
  clear()

  write(
    '...\n' +
    searchResults
      .slice(0, getRows(10))
      .map(res => res.title)
      .join('\n'),
    0,
    16
  )

  write(`-> ${input}`, 0, getRows(1))

  // return the main function
  return renderUI
}
