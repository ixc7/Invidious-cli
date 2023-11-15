import { spawnSync } from 'child_process'
import { cursorTo } from 'readline'
// import { clear } from 'console'
import { Fzf } from 'fzf'
import { bold, fmtTime, sanitize, getRows, write, clear } from './util.js'
import { download } from './download.js'

// top wrapper
export const mainUI = async (searchResults, destinationFolder) => {
  let pos = Infinity
  let selection = false
  let input = ''
  
  // keymap
  const actionsList = {
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

  const fzf = new Fzf(searchResults, { selector: item => item.title || '' })

  // main UI function
  const keypressRender = async (char, { name, sequence }) => {
    // check if keypress has an action
    if (actionsList[name]) await actionsList[name](sequence)
    
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
    
    // render thumbnail preview and video info
    if (selection) {
      const { title } = selection
      const { author, viewCount, publishedText, lengthSeconds, thumbnail } = selection.info
      
      // position to render thumbnails/list
      cursorTo(process.stdout, 0, 0)

      // render thumbnail w/timg on ctrl+left/home keypress
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

    // bottom input line with fzf
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
  return keypressRender
}
