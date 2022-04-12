import { cursorTo } from 'readline'
import { Fzf } from 'fzf'
import { bold, formatTime, noScroll, sanitize } from './util.js'
import { download } from './download.js'

export const keypressHandle = async (searchResultsList, destinationFolder) => {
  let position = Infinity
  let selection = false
  let input = ''

  const fzf = new Fzf(searchResultsList, { selector: item => item.title || '' })
  console.log(fzf)

  const draw = (content, x = 0, y = 0) => {
    cursorTo(process.stdout, x, y)
    process.stdout.write(content)
  }

  const keypressRender = async (char, { name, sequence }) => {
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
      q: () => {
        // ctrl-q
        if (sequence === '\x11') {
          noScroll()
          process.exit(0)
        }
        input += 'q'
      }

    }

    if (keymap[name]) await keymap[name]()
    else if (char && !sequence.includes('\x1b') && name !== 'return') input += char

    const matches = fzf.find(input).map(({ item }) => item)
    const len = matches.length - 1

    if (position > len) position = 0
    else if (position < 0) position = len

    selection = matches[position]

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

    draw(`-> ${input}`, 0, process.stdout.rows - 1)
  }

  // initial
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
